import { BatchStatus } from './enums.model';

/**
 * A stock-in lot for a product. `createdAt` is the FIFO ordering key — the
 * oldest batch is consumed first on dispatch.
 */
export interface Batch {
  id: string;
  productId: string;
  batchCode: string;
  /** Snapshot cost used to value line items when consumed. */
  unitCost: number;
  quantityReceived: number;
  /** Decremented by each dispatch; becomes 0 + `depleted` when exhausted. */
  quantityRemaining: number;
  status: BatchStatus;
  /** FIFO ordering key (oldest first). Mirrors `_creationTime` in the real schema. */
  createdAt: Date;
}
