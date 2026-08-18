import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Batch } from '../models/batch.model';
import { BATCHES, PRODUCTS } from '../models/sample-data';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _products: Product[] = PRODUCTS;
  private readonly _batches: Batch[] = BATCHES;

  products(): Product[] {
    return this._products;
  }

  getById(id: string): Product | undefined {
    return this._products.find((p) => p.id === id);
  }

  getBatchesByProduct(id: string): Batch[] {
    return this._batches
      .filter((b) => b.productId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  search(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this._products;
    }
    return this._products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.skuCode.toLowerCase().includes(q)
    );
  }

  inStock(product: Product): boolean {
    return product.currentQuantity > 0;
  }

  isLowStock(product: Product): boolean {
    return product.lowStockThreshold > 0 && product.currentQuantity <= product.lowStockThreshold;
  }

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