/**
 * Product category — `thread` exists in the real schema but is omitted from
 * client scope (see planning/constants).
 */
export type ProductCategory = 'sacks' | 'twines';

/** Subset of `STATUSES` used for the product catalog. */
export type ProductStatus = 'active' | 'archived';

/** Lifecycle of a stock batch; `depleted` once fully consumed. */
export type BatchStatus = 'active' | 'depleted';

/** Unit a dispatch is measured in; `meter` allows fractional values. */
export type DispatchUom = 'piece' | 'roll' | 'meter';

/**
 * UOMs that must be whole numbers (`piece`, `roll`) — `meter` is the only one
 * that permits fractions. Source: `DISPATCH_UOMS` / `INTEGER_UOMS` constants.
 */
export const INTEGER_UOMS: DispatchUom[] = ['piece', 'roll'];

/** True when the given UOM must be dispatched only as whole units. */
export function isIntegerUom(uom: DispatchUom): boolean {
  return INTEGER_UOMS.includes(uom);
}
