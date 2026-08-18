import { Component, input } from '@angular/core';
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

/** The three bottom-nav destinations. */
export type NavTab = 'products' | 'dispatch' | 'history';

/**
 * Route-aware bottom tab bar. Ionic's `ion-tab-bar` only auto-selects inside
 * `ion-tabs`, so this wrapper highlights the current tab from a dumb `active`
 * input the parent page passes in. Reused on every page.
 */
@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [IonTabBar, IonTabButton, IonIcon, IonLabel, RouterLink],
  templateUrl: 'bottom-nav.component.html',
  styleUrls: ['bottom-nav.component.scss'],
})
export class BottomNavComponent {
  /** Which tab the parent page is on; drives `[selected]` highlighting. */
  readonly active = input.required<NavTab>();
}
