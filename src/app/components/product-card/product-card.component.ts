import { Component, output, input } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    RouterLink,
  ],
  templateUrl: 'product-card.component.html',
  styleUrls: ['product-card.component.scss'],
})
/**
 * Catalog card for a single {@link Product}. Renders the product and links to
 * its detail page; the "Select" button bubbles the tapped product up via
 * {@link tap} for parent pickers (catalog + dispatch).
 */
export class ProductCardComponent {
  /** The product to render. */
  readonly product = input.required<Product>();
  /** Emits the tapped product when "Select" is pressed. */
  readonly tap = output<Product>();

  /** Stops the card's routerLink navigation and re-emits the product upward. */
  emitTap(event: Event): void {
    event.stopPropagation();
    this.tap.emit(this.product());
  }
}
