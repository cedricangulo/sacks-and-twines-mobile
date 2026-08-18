import { DispatchUom } from './enums.model';
import { Product } from './product.model';

/**
 * One fulfilled dispatch line. Note `dispatchUom` is the unit the user picked,
 * while `quantityDeducted` is the amount removed from the batch base UOM —
 * modeled separately as in the real schema (equal here, fractional meter allowed).
 */
export interface DispatchItem {
  /** Pre-rich display data (prototype keeps the product object inline). */
  product: Product;
  /** The batch actually consumed for this line. */
  batchId: string;
  dispatchUom: DispatchUom;
  /** Quantity in the UOM the user chose. */
  dispatchQuantity: number;
  /** Quantity to remove from the batch (base UOM). */
  quantityDeducted: number;
  /** Snapshotted from the consumed batch at dispatch time. */
  unitCost: number;
  /** `unitCost * quantityDeducted`. */
  lineTotal: number;
}

/**
 * A completed stock-out transaction. The prototype only completes dispatches
 * (no voiding), so `status` is fixed to `'completed'`.
 */
export interface Dispatch {
  id: string;
  /** Optional customer name or plate number per dispatch rules. */
  customerReference?: string;
  items: DispatchItem[];
  /** History groups by current day. */
  createdAt: Date;
  status: 'completed';
}
