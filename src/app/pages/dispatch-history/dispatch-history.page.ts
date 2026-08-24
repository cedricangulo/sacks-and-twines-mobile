import { Component, computed, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';
import { DispatchService } from '../../services/dispatch.service';
import { Dispatch } from '../../models/dispatch.model';

/** One calendar-day bucket of dispatches for the history list. */
interface DayGroup {
  label: string;
  dispatches: Dispatch[];
}

/**
 * Dispatch history grouped by calendar day (newest first). Each dispatch is a
 * native `ion-accordion` that expands to its line items — expand state and
 * accessibility are handled by Ionic instead of manual toggles.
 */
@Component({
  selector: 'app-dispatch-history',
  templateUrl: './dispatch-history.page.html',
  styleUrls: ['./dispatch-history.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonAccordionGroup,
    IonAccordion,
  ],
})
export class DispatchHistoryPage {
  private readonly dispatchService = inject(DispatchService);

  /** All recorded dispatches, bucketed by day with friendly labels. */
  readonly groups = computed<DayGroup[]>(() => this.groupByDay());

  /** Total value of one dispatch's line items. */
  totalOf(dispatch: Dispatch): number {
    return dispatch.items.reduce((acc, item) => acc + item.lineTotal, 0);
  }

  /** Count of items in one dispatch. */
  itemCountOf(dispatch: Dispatch): number {
    return dispatch.items.length;
  }

  /** Compact local time for the summary line. */
  timeOf(dispatch: Dispatch): string {
    return dispatch.createdAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Buckets the full history into day groups ("Today", "Yesterday", then a
   * short date), newest day first, dispatches newest-first within each.
   */
  private groupByDay(): DayGroup[] {
    const sorted = [...this.dispatchService.history()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const groups: DayGroup[] = [];
    const indexByLabel = new Map<string, number>();

    for (const dispatch of sorted) {
      const label = this.dayLabel(dispatch.createdAt);
      let index = indexByLabel.get(label);
      if (index === undefined) {
        index = groups.length;
        indexByLabel.set(label, index);
        groups.push({ label, dispatches: [] });
      }
      groups[index].dispatches.push(dispatch);
    }

    return groups;
  }

  /** "Today" / "Yesterday" / "Aug 24" / "Aug 24, 2025" style label. */
  private dayLabel(date: Date): string {
    const now = new Date();
    if (this.isSameDay(date, now)) {
      return 'Today';
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (this.isSameDay(date, yesterday)) {
      return 'Yesterday';
    }
    const sameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
  }

  /** True when both dates fall on the same calendar day. */
  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
