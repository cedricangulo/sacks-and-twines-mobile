import { Component, model, input } from '@angular/core';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { Product } from '../../models/product.model';
import { DispatchUom } from '../../models/enums.model';

@Component({
  selector: 'app-uom-selector',
  standalone: true,
  imports: [IonSegment, IonSegmentButton, IonLabel],
  templateUrl: 'uom-selector.component.html',
  styleUrls: ['uom-selector.component.scss'],
})
/**
 * Unit-of-measure picker for a dispatch line. Shows only the UOMs valid for
 * the product's category — sacks are dispensed as `piece` only; twines as
 * `meter` or `roll`. Two-way `model()` keeps the parent's `[(uom)]` in sync.
 */
export class UomSelectorComponent {
  /** The product whose category determines the valid UOMs. */
  readonly product = input.required<Product>();
  /** Currently selected dispatch UOM; two-way bound with `[(uom)]`. */
  readonly uom = model<DispatchUom>('piece');

  /** UOMs allowed for `product`'s category (sacks → piece; twines → meter/roll). */
  availableUoms(): DispatchUom[] {
    return this.product().category === 'sacks' ? ['piece'] : ['meter', 'roll'];
  }

  /** Writes the selected UOM back into the `uom` model signal, if valid. */
  onChange(value: unknown): void {
    if (value === 'piece' || value === 'roll' || value === 'meter') {
      this.uom.set(value);
    }
  }
}
