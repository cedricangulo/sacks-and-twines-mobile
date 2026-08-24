import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonLabel,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../models/product.model';

/**
 * Catalog landing page. Renders every product as a card, filterable live by
 * search text (`ion-searchbar`) and category (`ion-segment`); low-stock items
 * show an on-card warning badge. Filter state lives in
 * {@link ProductService} so it survives navigation away and back.
 */
@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
    IonLabel,
    IonIcon,
    IonButton,
    FormsModule,
    ProductCardComponent,
  ],
})
export class ProductsPage {
  private readonly productService = inject(ProductService);

  /** Live search query from the `ion-searchbar` (kept in the service). */
  readonly query = this.productService.searchQuery;

  /** Active category filter (kept in the service). */
  readonly category = this.productService.categoryFilter;

  /** Catalog filtered by both the active category and the search query. */
  readonly filteredProducts = computed<Product[]>(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return this.productService.products().filter((p) => {
      const matchesCategory = cat === 'all' || p.category === cat;
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.skuCode.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  });

  /** Bound to the `ion-segment` value via `(ionChange)`. */
  onCategoryChange(value: unknown): void {
    if (value === 'all' || value === 'sacks' || value === 'twines') {
      this.category.set(value);
    }
  }

  /** Resets both filters — used by the searchbar cancel and empty-state CTA. */
  clearFilters(): void {
    this.query.set('');
    this.category.set('all');
  }
}
