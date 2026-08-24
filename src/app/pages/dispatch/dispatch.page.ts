import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonReorderGroup,
  IonReorder,
  IonIcon,
  IonLabel,
  IonFooter,
  IonChip,
  ToastController,
  ItemReorderEventDetail,
} from '@ionic/angular/standalone';
import { ProductService } from '../../services/product.service';
import {
  DispatchService,
  InsufficientStockError,
} from '../../services/dispatch.service';
import { UomSelectorComponent } from '../../components/uom-selector/uom-selector.component';
import { DispatchItem } from '../../models/dispatch.model';
import { DispatchUom, isIntegerUom } from '../../models/enums.model';

/**
 * Stock-out screen. Lets the user pick a product + UOM + quantity, build a
 * reorderable queue (kept in `DispatchService.queue`), attach an optional
 * customer reference, and submit — running FIFO fulfillment with an atomic
 * insufficient-stock rejection surfaced as a danger toast. Removing a line
 * offers an undo toast for a few seconds.
 */
@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.page.html',
  styleUrls: ['./dispatch.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonReorderGroup,
    IonReorder,
    IonIcon,
    IonLabel,
    IonFooter,
    IonChip,
    RouterLink,
    FormsModule,
    UomSelectorComponent,
  ],
})
export class DispatchPage {
  private readonly productService = inject(ProductService);
  private readonly dispatchService = inject(DispatchService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  /** Currently selected product id in the `ion-select`. */
  readonly selectedProductId = signal('');
  /** Quantity typed into the number input, snapped on blur / add. */
  readonly qty = signal(1);
  /** UOM selector value, two-way bound via `[(uom)]`. */
  readonly uom = signal<DispatchUom>('piece');
  /** Optional customer name / plate number. */
  customerRef = '';

  /** The selected {@link Product}, or `undefined` until one is picked. */
  readonly selectedProduct = computed(() =>
    this.productService.getById(this.selectedProductId()),
  );

  /** Full product catalog for the picker options. */
  readonly catalog = computed(() => this.productService.products());

  /** Input step — whole units for integer UOMs (piece/roll), half-meters otherwise. */
  readonly step = computed(() => (isIntegerUom(this.uom()) ? 1 : 0.5));

  /** Reactive queue + running total from the shared service. */
  readonly queue = this.dispatchService.queue;
  readonly queueTotal = this.dispatchService.queueTotal;
  readonly queueCount = computed(() => this.queue().length);

  /** Sequential counter for unique queue line ids (the `@for` track key). */
  private queueSeq = 0;

  /**
   * Keeps `uom` valid for the selected product's category — switching from a
   * twine (`roll`) to a sack would otherwise leave a stale UOM that the
   * segment can't display and the queue would record.
   */
  constructor() {
    effect(() => {
      const category = this.selectedProduct()?.category;
      const uom = this.uom();
      if (
        (category === 'sacks' && uom !== 'piece') ||
        (category === 'twines' && uom !== 'meter' && uom !== 'roll')
      ) {
        this.uom.set(category === 'sacks' ? 'piece' : 'meter');
      }
    });
  }

  /**
   * Accepts typed quantities, keeping the last valid positive number so a
   * momentarily-empty field doesn't wipe the model mid-edit.
   */
  onQtyInput(event: CustomEvent<{ value?: string | number | null }>): void {
    const parsed = Number.parseFloat(String(event.detail.value ?? ''));
    if (Number.isFinite(parsed) && parsed > 0) {
      this.qty.set(parsed);
    }
  }

  /**
   * Snaps the quantity to the UOM's rules and floor — integers for
   * piece/roll, nearest half-meter for meter, never below 1. Runs on blur
   * and again before queueing so invalid input can't reach the queue.
   */
  normalizeQty(): void {
    const snapped = isIntegerUom(this.uom())
      ? Math.round(this.qty())
      : Math.round(this.qty() * 2) / 2;
    this.qty.set(Math.max(1, snapped));
  }

  /** Adds the configured product/UOM/quantity as one queue line. */
  addToQueue(): void {
    const product = this.selectedProduct();
    if (!product) {
      return;
    }
    this.normalizeQty();
    const quantity = this.qty();
    const unitCost = this.dispatchService.forecastUnitCost(product.id);
    const item: DispatchItem = {
      id: `q${this.queueSeq++}`,
      product,
      batchId: '',
      dispatchUom: this.uom(),
      dispatchQuantity: quantity,
      quantityDeducted: quantity,
      unitCost,
      lineTotal: unitCost * quantity,
    };
    this.dispatchService.addToQueue(item);
  }

  /**
   * Removes the queue line at `index` and offers an undo toast — restoring
   * puts the line back at its original position even if others changed.
   */
  async removeFromQueue(index: number): Promise<void> {
    const removed = this.dispatchService.removeFromQueue(index);
    if (!removed) {
      return;
    }
    const toast = await this.toastController.create({
      message: `${removed.item.product.name} removed`,
      duration: 4000,
      position: 'bottom',
      buttons: [
        {
          text: 'Undo',
          role: 'cancel',
          handler: () =>
            this.dispatchService.restoreQueueItem(removed.item, removed.index),
        },
      ],
    });
    await toast.present();
  }

  /** Applies an `ion-reorder` drag to the queue order. */
  onReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    this.dispatchService.reorderQueue(event.detail.from, event.detail.to);
    event.detail.complete();
  }

  /** Submits the queue; on success confirms with a toast and navigates to history. */
  async submitDispatch(): Promise<void> {
    try {
      this.dispatchService.submit(this.customerRef);
      const toast = await this.toastController.create({
        message: 'Dispatch submitted',
        color: 'success',
        duration: 1500,
        position: 'bottom',
      });
      await toast.present();
      this.router.navigate(['/dispatch-history']);
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        const toast = await this.toastController.create({
          message:
            'Not enough stock to fulfill the queue — reduce a quantity or remove a line, then retry.',
          color: 'danger',
          duration: 4000,
          position: 'bottom',
        });
        await toast.present();
      } else {
        console.error('Unexpected dispatch failure', error);
      }
    }
  }
}
