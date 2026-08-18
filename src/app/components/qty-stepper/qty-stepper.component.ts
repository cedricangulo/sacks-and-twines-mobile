import { Component, model, input } from '@angular/core';
import {
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-qty-stepper',
  standalone: true,
  imports: [IonButtons, IonButton, IonIcon, IonText],
  templateUrl: 'qty-stepper.component.html',
  styleUrls: ['qty-stepper.component.scss'],
})
/**
 * Increment / decrement quantity stepper. Owns its value via a two-way
 * `model()` so the parent stays in sync with `[(value)]`. `step` encodes the
 * dispatch UOM rules (whole pieces via integer `step`, fractional meters via
 * `step` of `0.5`).
 */
export class QtyStepperComponent {
  /** Current quantity; two-way bound with `[(value)]`. */
  readonly value = model(1);
  /** Floor below which `dec()` is a no-op and the button disables. */
  readonly min = input(1);
  /** Delta applied by each `-` / `+` press. */
  readonly step = input(1);
  /** Reserved for whole-unit enforcement (`piece`/`roll`) by the parent page. */
  readonly integerOnly = input(false);

  /** Decrements by `step`, clamped to `min`. */
  dec(): void {
    if (this.value() > this.min()) {
      this.value.update(
        (v) => +Math.max(this.min(), v - this.step()).toFixed(2),
      );
    }
  }

  /** Increments by `step`, capped at a safe upper bound. */
  inc(): void {
    this.value.update((v) => +Math.min(v + this.step(), 1e6).toFixed(2));
  }
}
