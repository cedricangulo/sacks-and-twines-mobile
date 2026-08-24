# Presentation Guide

Checking-day prep: a timed walkthrough that hits every rubric item, per-criterion
talking points, and likely questions with model answers.

> **Rule:** any member may be asked to demonstrate, locate, or explain any part
> of the implementation. Individual understanding is graded separately (15 pts).

## Demo Script (~5–7 min)

Run the app: `bun run start` → browser devtools mobile view (iPhone preset).
Rehearse this exact flow until smooth; it hits every rubric item at least once.

| #   | Action                                                                                        | What to say while doing it                                                                                         |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | App opens on **Products**                                                                     | "Lazy-loaded pages via Angular's `loadComponent` — this route bundle only loads when visited."                     |
| 2   | Tap category segment **Sacks**, search "rice"                                                 | "Filter + search state lives in `ProductService`, so it survives navigating away."                                 |
| 3   | Search something nonsense ("zzz")                                                             | "`@empty` block renders a real recovery action — Clear filters."                                                   |
| 4   | Open a low-stock product card → **detail page**                                               | "Route param `:id` read via `ActivatedRoute`; LOW STOCK badge is an `@if` on `isLowStock()`."                      |
| 5   | Show **Batches list**                                                                         | "Sorted oldest → newest — this is the FIFO consumption order."                                                     |
| 6   | Tab bar → **Dispatch**                                                                        | "Native `ion-tabs` shell; the Dispatch tab badge is the live queue count from a signal in the root component."     |
| 7   | Pick a **sack** product → UOM shows only _piece_; switch to a **twine** → _meter/roll_ appear | "Reusable UOM selector driven by `input()`; two-way bound with `model()`."                                         |
| 8   | Add 2 lines (same product twice), drag-reorder, remove one → **Undo toast**                   | "Queue is a signal array in `DispatchService`; reorder maps indexes straight onto it."                             |
| 9   | Type customer ref, **Submit**                                                                 | "Submit runs FIFO fulfillment atomically — validates all lines against simulated stock before deducting anything." |
| 10  | Land on **History**, expand the new dispatch                                                  | "Today's dispatches grouped by day; each line shows unit cost snapshotted from its batch at submit time."          |
| 11  | Back to Dispatch, queue a quantity **exceeding stock**, Submit                                | "Insufficient stock rejects the _whole_ dispatch — nothing deducted, danger toast explains recovery."              |
| 12  | Products tab → point at a LOW STOCK card after the big deduction                              | "Stock actually moved — quantities and badges recompute from the service signals."                                 |

## Timing

- Steps 1–6 ≈ 2 min · 7–10 ≈ 3 min · 11–12 ≈ 1 min
- If the instructor interrupts (they will), park on the answer and resume the script.

## Pre-demo runbook

```bash
bun install        # fresh clone
bun run lint       # must pass
bun run test       # green
bun run start      # dev server
```

- [ ] Phone-sized viewport ready (devtools iPhone preset, zoom 100%)
- [ ] Seed data intact (re-seed by restarting — state is in-memory)
- [ ] Know which product has multiple active batches (for the FIFO split-line moment)
- [ ] Know which product starts low-stock (badge visible without scrolling)
- [ ] Every member ran the full script solo at least twice

## Live-edit drills

Practice on a branch before checking day:

1. Lowercase a product name → template interpolation tweak.
2. Disable Add-to-queue unless qty > 0 → property binding change.
3. Make History collapse all accordions by default → remove `[multiple]="true"`.
4. Change low-stock badge color → `[color]` value in two places (card + detail) — discuss extracting a component.
5. Break a `track` id deliberately → observe NG0955 console error; explain why unique keys matter.

# Rubric Talking Points (85 pts group)

Open these files during the demo — don't recite from memory.

## Service Implementation (15)

- **Files:** `src/app/services/product.service.ts`, `src/app/services/dispatch.service.ts`
- `ProductService` = data-access layer: catalog as arrays, `getById()`,
  `getBatchesByProduct()` sorted oldest→newest (`product.service.ts:44`),
  `search()`, `isLowStock()`.
- `DispatchService` = business-logic layer: owns reactive `queue` / `history`
  signals, `queueTotal` as `computed()`, and **FIFO** in private `fulfill()`
  (`dispatch.service.ts:145`) — plans all lines against a _simulated_ stock map
  so rejection is atomic.
- Services inject each other: `DispatchService` → `ProductService`. Pages
  inject services via `inject()` field initializers.
- Sample data in `src/app/models/sample-data.ts` — allowed by Lab rule #3
  (static/sample data OK for prototypes).

## Routing / routerLink (10)

- **File:** `src/app/app.routes.ts` — 4 lazy routes + redirect/wildcard.
- Declarative: `[routerLink]="['/product', product().id]"` on the whole product
  card; `[routerLink]="'/dispatch'"` on detail CTA; plain `routerLink` in empty states.
- Imperative: `router.navigate(['/dispatch-history'])` after successful submit.
- Tab bar in `app.component.html`: `[routerLink]` + `[selected]` derived from
  the URL via `toSignal(router.events)`.

## Reusable Components (20)

- **Folder:** `src/app/components/`

| Component          | API                                                        | Used where                |
| ------------------ | ---------------------------------------------------------- | ------------------------- |
| `app-product-card` | `product = input.required<Product>()`                      | Products page loop        |
| `app-uom-selector` | `product = input.required()`, `uom = model<DispatchUom>()` | Dispatch page (`[(uom)]`) |
| `app-batch-list`   | `batches = input.required<Batch[]>()`                      | Product detail page       |

- "Each takes data through `input()` and knows nothing about which page hosts
  it — that's what makes them reusable. `uom-selector` also writes back through
  `model()`."
- Native Ionic components (`ion-tabs`, `ion-segment`, `ion-accordion-group`)
  are reused _by configuration_ — e.g. accordion history gets a11y from Ionic
  instead of custom JS.

## Angular Binding (15)

All five types, each with a file you can point to:

| Type             | Example                                                                                                      | Where                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Interpolation    | `{{ product().name }}`, `₱{{ queueTotal().toFixed(2) }}`                                                     | product-card, dispatch footer chip |
| Property binding | `[disabled]="!selectedProduct()"`, `[step]="step()"`, `[color]` ternary in batch-list                        | dispatch page, batch-list          |
| Event binding    | `(click)="addToQueue()"`, `(ionInput)` / `(ionBlur)` on qty, `(ionItemReorder)`                              | dispatch page                      |
| Two-way ngModel  | `[(ngModel)]="selectedProductId"`, `[(ngModel)]="customerRef"`, `[ngModel]` + `(ngModelChange)` on searchbar | dispatch page, products page       |
| Two-way model()  | `[(uom)]="uom"`                                                                                              | dispatch ↔ uom-selector            |

## @for and @if (10)

- `@for … track`: catalog, select options, queue lines, batches, history
  groups/dispatches/items, UOM options — every list has a stable `track` key.
- `@if`: LOW STOCK badges, queue empty vs list (`@else`), selected-product
  guard (`@if (selectedProduct(); as product)`), unknown-id fallback on detail,
  queue badge on the tab bar.
- `@empty`: no-products-found with a Clear-filters action.

## UI/UX & Mobile Adaptation (15)

- Native shell: headers, condense large title on Products, native `ion-tabs`
  bottom bar, accordions.
- Brand theme in `src/theme/variables.scss`; light-only by design.
- Mobile specifics: one column, ≥44px tap targets, thumb-zone footer submit,
  `inputmode="decimal"` quantity keypad, debounced searchbar, explicit trash
  button + undo toast instead of swipe-only delete.

# Q&A Bank (15 pts individual)

Rehearse aloud, not silently. Any member may be asked any of these.

Rehearse aloud, not silently. Any member may be asked any of these.

## Services & DI

**Where does your app get data?**
`sample-data.ts` feeds `ProductService`; the lab allows static data for
prototypes. Swapping to HTTP later only touches the service layer.

**What is `inject()` vs constructor injection?**
Same dependency injection, callable in field initializers — the Unit 1 pattern.

**Why does DispatchService need ProductService?**
FIFO reads batches and applies deductions through it — a single owner of stock
mutation.

## FIFO (the favorite question)

**Show me FIFO.**
`fulfill()` in `dispatch.service.ts:145`: batches come oldest→newest from
`getBatchesByProduct()`; the loop takes `Math.min(available, need)` per batch
until the line is satisfied.

**What if stock runs out mid-queue?**
It throws `InsufficientStockError`. Because validation ran on a _simulated_
stock map, zero deductions happened — atomic rejection.

**Why does history show different unit costs for the same product?**
Each fulfilled line snapshots its own batch's cost at submit time.

## Signals

**Signal vs computed?**
Signal = writable source of truth (`queue`). Computed = derived, cached,
auto-tracks its dependencies (`queueTotal`, `activeTab`, `filteredProducts`).

**Why does the tab badge update instantly?**
The root component computes it from `dispatchService.queue()` — the same
signal instance is shared app-wide.

## Routing

**How does detail know which product?**
`route.snapshot.paramMap.get('id')` in `product-detail.page.ts`.

**What's lazy loading buying you?**
Each page compiles to its own chunk and is fetched on first visit via
`loadComponent`.

## Components & bindings

**Child→parent communication?**
`model()` two-way binding on `uom-selector`. An `output()` would emit events;
we removed an unused `(tap)` output to keep no filler.

**Change the price display to uppercase?**
Edit the interpolation in the template — see the drills in
the Live-edit drills above.

**What does `track` do in @for?**
Gives each row a stable identity key for DOM reuse; every list here uses a
unique item id.

## Honest-limit answers (better than bluffing)

**Where's your backend?**
Prototype scope per Lab rule #3; the service layer isolates the future swap.

**Why were some earlier components removed?**
`qty-stepper`, `bottom-nav`, and `alert-banner` were folded into an inline
UOM-aware quantity input, native `ion-tabs`, and Ionic toasts — fewer custom
parts, less code to defend.
