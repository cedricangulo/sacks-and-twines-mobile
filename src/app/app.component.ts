import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { DispatchService } from './services/dispatch.service';

/**
 * App shell. Wraps the single `ion-router-outlet` in a real `ion-tabs` so the
 * bottom tab bar is native Ionic chrome (pages render above it — a page's own
 * `ion-footer` stacks on top of the bar without CSS hacks). Tab selection is
 * derived from the router URL so nested pages (`/product/:id`) keep their
 * parent tab highlighted.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge,
    RouterLink,
  ],
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly dispatchService = inject(DispatchService);

  /** Live count of queued lines, shown as a badge on the Dispatch tab. */
  readonly queueCount = computed(() => this.dispatchService.queue().length);

  /** Router URL as a signal, updated on every successful navigation. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Active tab key derived from the URL (`/product/:id` maps to products). */
  readonly activeTab = computed(() => {
    const url = this.url();
    if (url.startsWith('/dispatch-history')) {
      return 'history';
    }
    if (url.startsWith('/dispatch')) {
      return 'dispatch';
    }
    return 'products';
  });
}
