import { TestBed } from '@angular/core/testing';
import { DispatchService } from './dispatch.service';
import { BATCHES, PRODUCTS } from '../models/sample-data';
import { Batch } from '../models/batch.model';
import { Product } from '../models/product.model';

describe('DispatchService', () => {
  let service: DispatchService;

  const b11 = (): Batch => BATCHES.find((b) => b.id === 'b11') as Batch;
  const b12 = (): Batch => BATCHES.find((b) => b.id === 'b12') as Batch;
  const p6 = (): Product => PRODUCTS.find((p) => p.id === 'p6') as Product;

  beforeEach(() => {
    b11().quantityRemaining = 120;
    b11().status = 'active';
    b12().quantityRemaining = 600;
    b12().status = 'active';
    p6().currentQuantity = 720;
    TestBed.resetTestingModule();
    service = TestBed.inject(DispatchService);
  });

  it('consumes the oldest active batch first (FIFO)', () => {
    service.addToQueue(p6(), 'meter', 400);
    service.submit();

    expect(service.queue()).toEqual([]);
    const last = service.history()[service.history().length - 1];
    const byBatch = new Map(
      last.items.map((i) => [i.batchId, i.quantityDeducted])
    );
    expect(byBatch.get('b11')).toBe(120);
    expect(byBatch.get('b12')).toBe(280);
    expect(b11().quantityRemaining).toBe(0);
    expect(b11().status).toBe('depleted');
    expect(b12().quantityRemaining).toBe(320);
    expect(p6().currentQuantity).toBe(320);
  });

  it('rejects an entire dispatch when stock is insufficient (atomic)', () => {
    service.addToQueue(p6(), 'meter', 800);

    expect(() => service.submit()).toThrowError('INSUFFICIENT_STOCK');

    expect(b11().quantityRemaining).toBe(120);
    expect(b12().quantityRemaining).toBe(600);
    expect(p6().currentQuantity).toBe(720);
    expect(service.queue().length).toBe(1);
  });

  it('tracks the queue total reactively', () => {
    service.addToQueue(p6(), 'meter', 100);
    expect(service.queueTotal()).toBeCloseTo(120, 5);
  });
});