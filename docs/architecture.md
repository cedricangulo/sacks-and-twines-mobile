# Architecture

Ionic-Angular prototype following modern Angular patterns: standalone
components, signals for state, `inject()` DI, lazy-loaded routes, and native
`@if`/`@for` template control flow.

## Layers

```
pages/  →  components/  →  services/  →  models/
(UI)      (reusable UI)   (state+rules)  (types+data)
```

- **Pages** (`src/app/pages/`) — four route-level screens. Thin: they compose
  services and components; no business rules live here.
- **Components** (`src/app/components/`) — reusable UI with explicit APIs
  (`input.required()`, `model()`). They know nothing about which page hosts them.
- **Services** (`src/app/services/`) — the app's "backend":
  - `ProductService` — data access over in-memory arrays (catalog + batches),
    plus filter/search state that survives route navigation.
  - `DispatchService` — owns queue/history signals and all dispatch rules
    (FIFO, atomicity). Injects `ProductService`.
- **Models** (`src/app/models/`) — TypeScript types, enums
  (`enums.model.ts` incl. `INTEGER_UOMS`), and seeded sample data.

## State management

All state is signals:

| State                               | Kind                          | Owner                                  |
| ----------------------------------- | ----------------------------- | -------------------------------------- |
| Catalog / batches                   | plain arrays                  | `ProductService`                       |
| Search + category filter            | `signal`                      | `ProductService` (survives navigation) |
| Dispatch queue                      | `signal<DispatchItem[]>`      | `DispatchService`                      |
| Queue total / count                 | `computed()`                  | derived from queue                     |
| History                             | `signal<Dispatch[]>` (seeded) | `DispatchService`                      |
| Page inputs (qty, uom, selected id) | `signal` / `model()`          | pages/components                       |

Derived UI (tab highlighting, low-stock badges) is computed from these — no
manual refresh anywhere.

## Routing

`app.routes.ts` defines four lazy routes via `loadComponent` plus a redirect
and wildcard:

- `/products` — catalog
- `/product/:id` — detail (param read via `ActivatedRoute.snapshot`)
- `/dispatch` — stock-out workflow
- `/dispatch-history` — day-grouped history

The bottom tab bar lives in the root `AppComponent` as a real `ion-tabs`
shell. The active tab is derived from the router URL (`toSignal(router.events)`),
so nested pages like `/product/:id` keep the Products tab highlighted. Pages
render above the tab bar through a single `ion-router-outlet`.

## Key design decisions

1. **Atomic FIFO fulfillment** — `fulfill()` plans every queued line against a
   _simulated_ remaining-stock map before any deduction. If any line can't be
   satisfied, it throws `InsufficientStockError` and nothing changes.
2. **Cost snapshotting** — each fulfilled line records its batch's unit cost at
   submit time, so history stays accurate after prices change.
3. **Unique line ids** — fulfilled lines get ids like `f0-b11`, never the bare
   batch id, because two queue lines can consume the same batch (this keeps
   `@for track` keys unique).
4. **UOM-aware quantity snapping** — integer UOMs (`piece`, `roll`) round to
   whole units; `meter` allows half-unit steps. Enforced on blur and again
   before queueing.
5. **Native-first UI** — Ionic chrome (`ion-tabs`, `ion-segment`,
   `ion-accordion-group`, toasts) instead of custom components where Ionic
   already solves it well; custom components exist only where genuinely reused.
6. **No filler** — every element serves the Products or Dispatch workflow
   (Lab rule #6); dead code is removed on sight.
