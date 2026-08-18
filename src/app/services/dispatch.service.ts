import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { DispatchUom } from '../models/enums.model';
import { Dispatch, DispatchItem } from '../models/dispatch.model';
import { SEED_DISPATCHES } from '../models/sample-data';

export class InsufficientStockError extends Error {
  constructor() {
    super('INSUFFICIENT_STOCK');
    this.name = 'InsufficientStockError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class DispatchService {
  private readonly productService = inject(ProductService);

  readonly queue = signal<DispatchItem[]>([]);
  readonly history = signal<Dispatch[]>(SEED_DISPATCHES);

  readonly queueTotal = computed(() =>
    this.queue().reduce((acc, item) => acc + item.lineTotal, 0)
  );

  addToQueue(product: Product, dispatchUom: DispatchUom, dispatchQuantity: number): void {
    const unitCost = this.forecastUnitCost(product.id);
    const item: DispatchItem = {
      product,
      batchId: '',
      dispatchUom,
      dispatchQuantity,
      quantityDeducted: dispatchQuantity,
      unitCost,
      lineTotal: unitCost * dispatchQuantity,
    };
    this.queue.update((prev) => [...prev, item]);
  }

  removeFromQueue(index: number): void {
    this.queue.update((prev) => prev.filter((_, i) => i !== index));
  }

  clearQueue(): void {
    this.queue.set([]);
  }

  submit(customerReference?: string): void {
    const queueLines = this.queue();
    if (queueLines.length === 0) {
      return;
    }

    const items = this.planFulfillment(queueLines);

    for (const item of items) {
      this.productService.applyBatchDeduction(item.batchId, item.quantityDeducted);
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

  todayHistory(): Dispatch[] {
    return this.history().filter((d) => this.isSameDay(d.createdAt, new Date()));
  }

  private forecastUnitCost(productId: string): number {
    const first = this.productService
      .getBatchesByProduct(productId)
      .find((b) => b.status === 'active' && b.quantityRemaining > 0);
    return first?.unitCost ?? 0;
  }

  private planFulfillment(queueLines: DispatchItem[]): DispatchItem[] {
    const remaining = new Map<string, number>();
    for (const batch of this.productService.products().flatMap((p) =>
      this.productService.getBatchesByProduct(p.id)
    )) {
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

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}