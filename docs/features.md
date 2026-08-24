# Features

Two capstone modules implemented: **Products** (stock-in view) and
**Dispatch** (stock-out workflow).

## Products

### Catalog (`/products`)

- Category segment filter (All / Sacks / Twines) and debounced live search on
  name or SKU; both live in `ProductService` so state survives navigation.
- Each card shows name, SKU, base UOM, on-hand quantity, and a LOW STOCK badge
  when `currentQuantity <= lowStockThreshold`.
- Empty search results render an `@empty` state with a Clear-filters action.
- Tapping a card navigates to the product detail page.

### Product detail (`/product/:id`)

- Resolves the product from the route param; unknown ids get a not-found state
  with a path back to the catalog.
- Summary card with on-hand quantity, total asset value, and low-stock flag.
- Batch list ordered oldest → newest — the FIFO consumption order — each batch
  showing code, remaining quantity, unit cost, and active/depleted status.

## Dispatch

### New dispatch (`/dispatch`)

1. Pick a product from the catalog select.
2. Choose a UOM — constrained by category:
   - Sacks → `piece` only
   - Twines → `meter` or `roll`
3. Enter a quantity:
   - `piece` / `roll` are snapped to whole units
   - `meter` allows half-unit steps
   - Snapping runs on blur and again before queueing; minimum is 1
4. Add to queue. The queue supports drag-reordering, per-line remove with an
   undo toast, and a live count + total in the footer chip (also mirrored as a
   badge on the Dispatch tab).
5. Optionally enter a customer reference / plate number.
6. Submit.

### Submission rules

- **FIFO** — stock is consumed oldest batch first; a line spanning multiple
  batches produces one history line per consumed batch.
- **Atomicity** — all lines are validated against simulated remaining stock
  before any deduction. Insufficient stock rejects the entire dispatch with a
  danger toast and recovery hint; nothing is deducted and the queue is kept.
- **Cost snapshot** — every fulfilled line records its batch's unit cost at
  submit time.
- On success: success toast, queue cleared, navigate to history.

### History (`/dispatch-history`)

- Dispatches grouped by day (newest first) as native accordions.
- Each dispatch header shows id, time, item count, customer reference (or
  "Walk-in"), and total.
- Expanding shows per-line detail: product, dispatched quantity + UOM, snapshotted
  unit cost, and line total.

## Business rules reference

| Rule                                | Where enforced                                                             |
| ----------------------------------- | -------------------------------------------------------------------------- |
| UOMs per category                   | `uom-selector.component.ts` (`availableUoms`)                              |
| Integer-only UOMs (`piece`, `roll`) | `enums.model.ts` (`isIntegerUom`) + qty snapping in `dispatch.page.ts`     |
| FIFO order                          | `ProductService.getBatchesByProduct` sort + `DispatchService.fulfill` loop |
| Low-stock threshold                 | `ProductService.isLowStock`; threshold `0` disables the alert              |
| Atomic insufficient-stock rejection | `DispatchService.fulfill` simulated map + `InsufficientStockError`         |
