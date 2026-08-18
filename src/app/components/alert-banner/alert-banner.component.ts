import { Component, input } from '@angular/core';
import { IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';

/**
 * Status banner Ionic doesn't ship as a primitive. Composes `ion-item` +
 * `ion-icon` + `ion-label` behind a tone API and is reused for the two stock
 * warnings (low-stock on detail, insufficient-stock on dispatch).
 */
@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [IonItem, IonIcon, IonLabel],
  templateUrl: 'alert-banner.component.html',
  styleUrls: ['alert-banner.component.scss'],
})
export class AlertBannerComponent {
  /** Visual tone: amber `warning` or red `danger`. */
  readonly tone = input<'warning' | 'danger'>('warning');
  /** The text shown to the user. */
  readonly message = input.required<string>();
}
