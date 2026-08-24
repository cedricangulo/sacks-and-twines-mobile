# Sacks & Twines — Mobile Prototype

An Ionic-Angular mobile prototype of the Sacks & Twines capstone: a
product catalog with FIFO batch tracking and a stock-out (dispatch) workflow.
Built for Lab 1 (Unit 1: Mobile Application Foundation Review).

## Stack

- Angular (standalone components, signals, `@for`/`@if` control flow)
- Ionic 8 (standalone imports, native `ion-tabs` shell)
- Bun as package manager / script runner
- In-memory sample data (prototype scope — no backend by design)

## Getting started

```bash
bun install
bun run start     # dev server
bun run lint      # eslint
bun run test      # unit tests (karma/jasmine)
bun run build     # production build → www/
```

## Features

1. **Products** — catalog with category filter, live search, product detail
   with low-stock alerts and FIFO-ordered batch lists
2. **Dispatch** — stock-out queue with UOM rules, atomic FIFO fulfillment,
   optional customer reference, day-grouped dispatch history

## Folder structure

```
src/app/
├── app.component.*        # ion-tabs shell + bottom nav bar
├── app.routes.ts          # lazy-loaded route table
├── models/                # types, enums, business constants, sample data
├── services/              # ProductService, DispatchService (+ specs)
├── components/            # reusable UI: product-card, uom-selector, batch-list
└── pages/                 # products, product-detail, dispatch, dispatch-history
```

## Documentation

| Doc                                  | Contents                                            |
| ------------------------------------ | --------------------------------------------------- |
| [architecture.md](./architecture.md) | Layers, state management, routing, design decisions |
| [features.md](./features.md)         | Feature behavior and business rules                 |
| [presentation.md](./presentation.md) | Demo walkthrough, rubric talking points, Q&A bank   |

## Theme

Brand palette lives in `src/theme/variables.scss` (light-only): primary blue
`#1447e6`, warning amber `#f0b100`, danger red `#e7000b`.
