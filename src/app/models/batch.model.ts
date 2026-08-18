import { BatchStatus } from './enums.model';

export interface Batch {
  id: string;
  productId: string;
  batchCode: string;
  unitCost: number;
  quantityReceived: number;
  quantityRemaining: number;
  status: BatchStatus;
  createdAt: Date;
}