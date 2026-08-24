import { ProductCategory, ProductStatus } from './enums.model';

/**
 * A stockable catalog item. Mirrors the `products` table (lightweight — only
 * the fields the two features need).
 */
export interface Product {
  id: string;
  skuCode: string;
  name: string;
  category: ProductCategory;
  /** Stock-in unit: sacks ship by `piece`, twines by `meter`. */
  baseUom: 'piece' | 'roll' | 'meter';
  /** Running total currently on-hand, kept in sync with batches on dispatch. */
  currentQuantity: number;
  /** Estimated value of stock on hand. */
  totalAssetValue: number;
  /** `0` disables the low-stock alert. */
  lowStockThreshold: number;
  status: ProductStatus;
}
