import { Component, input } from '@angular/core';
import {
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { Batch } from '../../models/batch.model';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [IonList, IonItem, IonLabel, IonBadge],
  templateUrl: 'batch-list.component.html',
  styleUrls: ['batch-list.component.scss'],
})
/**
 * Read-only list of a product's stock batches, oldest → newest, each with its
 * remaining quantity, unit cost, and an active/depleted status badge. Reused
 * to visualize FIFO order on the product detail and dispatch screens.
 */
export class BatchListComponent {
  /** Batches to render, already in FIFO (oldest-first) order. */
  readonly batches = input.required<Batch[]>();
}
