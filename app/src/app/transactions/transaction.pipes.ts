import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from './transactions.page';

/**
 * Sums the amounts of a transaction group.
 * Usage: group.items | groupTotal
 */
@Pipe({ name: 'groupTotal', standalone: true })
export class GroupTotalPipe implements PipeTransform {
  transform(items: Transaction[]): number {
    return items.reduce((acc, t) => acc + t.amount, 0);
  }
}

/**
 * Returns true if the value is positive (used for conditional class binding).
 * Usage: total | positiveTotal
 */
@Pipe({ name: 'positiveTotal', standalone: true })
export class PositiveTotalPipe implements PipeTransform {
  transform(total: number): boolean {
    return total > 0;
  }
}

/**
 * Formats a group total as a signed currency string.
 * Usage: total | formatGroupTotal
 */
@Pipe({ name: 'formatGroupTotal', standalone: true })
export class FormatGroupTotalPipe implements PipeTransform {
  transform(total: number): string {
    const abs = Math.abs(total).toLocaleString('en-US', {
      minimumFractionDigits: total % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return total < 0 ? `-$${abs}` : `+$${abs}`;
  }
}
