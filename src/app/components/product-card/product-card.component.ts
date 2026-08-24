import { Component, computed, inject, input } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

/**
 * Catalog card for a single {@link Product}. Renders the product, its on-hand
 * quantity, and a warning badge when the stock is at/below the reorder
 * threshold. The whole card links to the product detail page.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    RouterLink,
  ],
  templateUrl: 'product-card.component.html',
  styleUrls: ['product-card.component.scss'],
})
export class ProductCardComponent {
  private readonly productService = inject(ProductService);

  /** Indicator shown when a product is at/below its reorder threshold. */
  readonly lowStockLabel = 'LOW STOCK';

  /** The product to render. */
  readonly product = input.required<Product>();

  /** True when on-hand is at/below the product's low-stock threshold. */
  readonly isLowStock = computed(() =>
    this.productService.isLowStock(this.product()),
  );
}
