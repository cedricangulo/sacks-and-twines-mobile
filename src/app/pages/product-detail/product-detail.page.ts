import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonLabel,
  IonBadge,
  IonIcon,
} from '@ionic/angular/standalone';
import { ProductService } from '../../services/product.service';
import { BatchListComponent } from '../../components/batch-list/batch-list.component';

/**
 * Single-product detail page (`/product/:id`). Reads the `:id` route param,
 * looks the product up, flags low stock on the summary card, and lists its
 * batches oldest → newest (FIFO) with a link into the dispatch flow.
 */
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonLabel,
    IonBadge,
    IonIcon,
    RouterLink,
    BatchListComponent,
  ],
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  /** The product resolved from the route's `:id` param, or `undefined`. */
  readonly product = computed(() =>
    this.productService.getById(this.route.snapshot.paramMap.get('id') ?? ''),
  );

  /** True when the product is at/below its low-stock threshold. */
  readonly isLowStock = computed(
    () =>
      this.product() != null && this.productService.isLowStock(this.product()!),
  );

  /** The product's batches, FIFO-ordered, for the batch list. */
  readonly batches = computed(() =>
    this.product()
      ? this.productService.getBatchesByProduct(this.product()!.id)
      : [],
  );

  /** Sentence-case category for display ("sacks" → "Sacks"). */
  categoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}
