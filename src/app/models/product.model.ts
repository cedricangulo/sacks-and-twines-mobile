import { ProductCategory, ProductStatus } from './enums.model';

export interface Product {
  id: string;
  skuCode: string;
  name: string;
  category: ProductCategory;
  baseUom: 'piece' | 'roll' | 'meter';
  currentQuantity: number;
  totalAssetValue: number;
  lowStockThreshold: number;
  status: ProductStatus;
  imagePath?: string;
}