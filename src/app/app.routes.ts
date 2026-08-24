import { Routes } from '@angular/router';

/**
 * Lazy-loaded route table for the Products + Dispatch prototype. Each page is
 * independently loaded on demand via `loadComponent` (Unit 1.2 pattern).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.page').then((p) => p.ProductsPage),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.page').then(
        (p) => p.ProductDetailPage,
      ),
  },
  {
    path: 'dispatch',
    loadComponent: () =>
      import('./pages/dispatch/dispatch.page').then((p) => p.DispatchPage),
  },
  {
    path: 'dispatch-history',
    loadComponent: () =>
      import('./pages/dispatch-history/dispatch-history.page').then(
        (p) => p.DispatchHistoryPage,
      ),
  },
  { path: '**', redirectTo: 'products' },
];
