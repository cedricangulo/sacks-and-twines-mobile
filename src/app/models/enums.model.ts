export type ProductCategory = 'sacks' | 'twines';
export type ProductStatus = 'active' | 'archived';
export type BatchStatus = 'active' | 'depleted';
export type DispatchUom = 'piece' | 'roll' | 'meter';

export const INTEGER_UOMS: DispatchUom[] = ['piece', 'roll'];

export function isIntegerUom(uom: DispatchUom): boolean {
  return INTEGER_UOMS.includes(uom);
}