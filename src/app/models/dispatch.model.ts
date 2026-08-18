import { DispatchUom } from './enums.model';
import { Product } from './product.model';

export interface DispatchItem {
  product: Product;
  batchId: string;
  dispatchUom: DispatchUom;
  dispatchQuantity: number;
  quantityDeducted: number;
  unitCost: number;
  lineTotal: number;
}

export interface Dispatch {
  id: string;
  customerReference?: string;
  items: DispatchItem[];
  createdAt: Date;
  status: 'completed';
}