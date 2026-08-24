import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductService } from './product.service';
import { Dispatch, DispatchItem } from '../models/dispatch.model';
import { SEED_DISPATCHES } from '../models/sample-data';

/** Thrown by {@link DispatchService.submit} when stock can't fulfill a line. */
export class InsufficientStockError extends Error {
  constructor() {
    super('INSUFFICIENT_STOCK');
    this.name = 'InsufficientStockError';
  }
}

/** A line just removed from the queue, kept for undo. */
export interface RemovedQueueItem {
  item: DispatchItem;
  index: number;
}

/**
 * Service layer that orchestrates dispatch business rules on top of
 * {@link ProductService}. Owns the reactive queue + history (signals), and
 * runs FIFO batch consumption with atomic insufficient-stock rejection.
 */
@Injectable({
  providedIn: 'root',
})
export class DispatchService {
  private readonly productService = inject(ProductService);

  /** Items added by the user, not yet submitted. */
  readonly queue = signal<DispatchItem[]>([]);
  /** Submitted dispatches; preseeded so the history page isn't empty. */
  readonly history = signal<Dispatch[]>(SEED_DISPATCHES);

  /** Reactive sum of queued {@link DispatchItem.lineTotal}, shown in the queue badge. */
  readonly queueTotal = computed(() =>
    this.queue().reduce((acc, item) => acc + item.lineTotal, 0),
  );

  /**
   * Adds one prebuilt line item to the queue. Callers construct the
   * {@link DispatchItem} (using {@link forecastUnitCost} for the line's cost
   * estimate), then pass it here — keeps the service dumb about page inputs.
   */
  addToQueue(item: DispatchItem): void {
    this.queue.update((prev) => [...prev, item]);
  }

  /**
   * Removes the queued line at `index`. Returns the removed item and its
   * position so the caller can offer an undo, or `null` when the index is
   * already gone (e.g. a stale row after a reorder).
   */
  removeFromQueue(index: number): RemovedQueueItem | null {
    const item = this.queue()[index];
    if (!item) {
      return null;
    }
    this.queue.update((prev) => prev.filter((_, i) => i !== index));
    return { item, index };
  }

  /** Re-inserts a removed line at `index` (undo support), clamping to the end. */
  restoreQueueItem(item: DispatchItem, index: number): void {
    this.queue.update((prev) => {
      const next = [...prev];
      next.splice(Math.min(Math.max(index, 0), next.length), 0, item);
      return next;
    });
  }

  /** Moves one queued line from index `from` to index `to` (`ion-reorder`). */
  reorderQueue(from: number, to: number): void {
    this.queue.update((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  /** Empties the queue. */
  clearQueue(): void {
    this.queue.set([]);
  }

  /**
   * Validates and commits the current queue as one dispatch.
   * Applies FIFO fulfillment; throws {@link InsufficientStockError} (nothing
   * deducted, queue kept) if any line can't be fully satisfied. On success,
   * deducts stock, appends to history, and clears the queue. `customerReference`
   * is optional per dispatch rules.
   */
  submit(customerReference?: string): void {
    const queueLines = this.queue();
    if (queueLines.length === 0) {
      return;
    }

    const items = this.fulfill(queueLines);

    for (const item of items) {
      this.productService.applyBatchDeduction(
        item.batchId,
        item.quantityDeducted,
      );
    }

    this.history.update((prev) => [
      ...prev,
      {
        id: `d${Date.now()}`,
        customerReference: customerReference?.trim() || undefined,
        items,
        createdAt: new Date(),
        status: 'completed',
      },
    ]);
    this.queue.set([]);
  }

  /** Returns dispatches recorded today (the history view's default scope). */
  todayHistory(): Dispatch[] {
    return this.history().filter((d) =>
      this.isSameDay(d.createdAt, new Date()),
    );
  }

  /** Unit cost of the product's oldest active batch, used to estimate queue totals. */
  forecastUnitCost(productId: string): number {
    const first = this.productService
      .getBatchesByProduct(productId)
      .find((b) => b.status === 'active' && b.quantityRemaining > 0);
    return first?.unitCost ?? 0;
  }

  /**
   * Plans FIFO fulfillment for every queued line on a *simulated* stock map,
   * so all lines validate before any real deduction (atomic rejection). Returns
   * the concrete {@link DispatchItem} lines — one per consumed batch, oldest
   * first — each carrying a `unitCost` snapshotted from that batch and a
   * unique `id` (a product may consume the same batch twice, so ids can't be
   * batch ids). Throws {@link InsufficientStockError} if any line remains unmet.
   */
  private fulfill(queueLines: DispatchItem[]): DispatchItem[] {
    const remaining = new Map<string, number>();
    for (const batch of this.productService
      .products()
      .flatMap((p) => this.productService.getBatchesByProduct(p.id))) {
      remaining.set(batch.id, batch.quantityRemaining);
    }

    const result: DispatchItem[] = [];

    for (const line of queueLines) {
      const product = line.product;
      let need = line.dispatchQuantity;
      const activeBatches = this.productService
        .getBatchesByProduct(product.id)
        .filter((b) => b.status === 'active' && remaining.get(b.id)! > 0);

      for (const batch of activeBatches) {
        if (need <= 0) {
          break;
        }
        const available = remaining.get(batch.id)!;
        const take = Math.min(available, need);
        if (take <= 0) {
          continue;
        }
        result.push({
          id: `f${result.length}-${batch.id}`,
          product,
          batchId: batch.id,
          dispatchUom: line.dispatchUom,
          dispatchQuantity: take,
          quantityDeducted: take,
          unitCost: batch.unitCost,
          lineTotal: batch.unitCost * take,
        });
        remaining.set(batch.id, available - take);
        need -= take;
      }

      if (need > 0) {
        throw new InsufficientStockError();
      }
    }

    return result;
  }

  /** True when both dates fall on the same calendar day. */
  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
