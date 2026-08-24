import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { Batch } from '../models/batch.model';
import { BATCHES, PRODUCTS } from '../models/sample-data';

/** Catalog category filter values for the products landing page. */
export type CategoryFilter = 'all' | 'sacks' | 'twines';

/**
 * Data-access layer for the catalog & batches (the in-app "backend").
 * Read-only static data held as plain arrays; mutating helpers are used by
 * {@link DispatchService} to apply stock deductions on submit.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _products: Product[] = PRODUCTS;
  private readonly _batches: Batch[] = BATCHES;

  /**
   * Active category filter. Lives here (not on the page) so the filter state
   * survives route navigation back to the catalog.
   */
  readonly categoryFilter = signal<CategoryFilter>('all');

  /** Live search query. Kept here so it survives route navigation too. */
  readonly searchQuery = signal('');

  /** Returns the full product catalog. */
  products(): Product[] {
    return this._products;
  }

  /** Finds a product by id, or `undefined` if not found. */
  getById(id: string): Product | undefined {
    return this._products.find((p) => p.id === id);
  }

  /**
   * Returns a product's batches sorted oldest → newest by `createdAt`.
   * This is the FIFO consumption order used by dispatch.
   */
  getBatchesByProduct(id: string): Batch[] {
    return this._batches
      .filter((b) => b.productId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Filters the catalog by a case-insensitive match on name or SKU.
   * An empty/whitespace query returns the full catalog.
   */
  search(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this._products;
    }
    return this._products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.skuCode.toLowerCase().includes(q),
    );
  }

  /** True when the product has any stock on hand. */
  inStock(product: Product): boolean {
    return product.currentQuantity > 0;
  }

  /**
   * True when on-hand is at or below the alert threshold.
   * A `lowStockThreshold` of `0` disables the alert.
   */
  isLowStock(product: Product): boolean {
    return (
      product.lowStockThreshold > 0 &&
      product.currentQuantity <= product.lowStockThreshold
    );
  }

  /**
   * Applies a stock deduction to a batch: decrements `quantityRemaining`,
   * marks the batch `depleted` when it reaches zero, and reduces the owning
   * product's `currentQuantity`. Called by dispatch once fulfillment is validated.
   */
  applyBatchDeduction(batchId: string, quantityDeducted: number): void {
    const batch = this._batches.find((b) => b.id === batchId);
    if (!batch) {
      return;
    }
    batch.quantityRemaining -= quantityDeducted;
    if (batch.quantityRemaining <= 0) {
      batch.quantityRemaining = 0;
      batch.status = 'depleted';
    }
    const product = this.getById(batch.productId);
    if (product) {
      product.currentQuantity -= quantityDeducted;
    }
  }
}
