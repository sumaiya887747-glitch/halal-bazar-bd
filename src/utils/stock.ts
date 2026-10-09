import { ProductItem } from '../types/website';

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/**
 * Extract numerical stock quantity for a product safely.
 * If inStock is explicitly false and stockQuantity is unset, treats as 0.
 * Default fallback is 12 units if neither is specified.
 */
export function getProductStockQty(product: ProductItem): number {
  if (product.stockQuantity !== undefined && product.stockQuantity !== null) {
    return Math.max(0, Number(product.stockQuantity) || 0);
  }
  if (product.inStock === false) {
    return 0;
  }
  return 12; // Standard default inventory
}

/**
 * Checks whether a product has low stock or is out of stock.
 * Compares against per-product override threshold or global store threshold.
 */
export function isProductLowStock(
  product: ProductItem,
  globalThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): boolean {
  if (product.inStock === false) {
    return true;
  }
  const threshold = product.lowStockThreshold ?? globalThreshold;
  const qty = getProductStockQty(product);
  return qty <= threshold;
}

/**
 * Filters a list of products to return all items that are low in stock or out of stock.
 */
export function getLowStockProducts(
  products: ProductItem[],
  globalThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): ProductItem[] {
  return products.filter((p) => isProductLowStock(p, globalThreshold));
}

/**
 * Returns badge label and color styling for inventory status.
 */
export function getStockStatusDisplay(
  product: ProductItem,
  globalThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): {
  qty: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isLow: boolean;
  isOut: boolean;
} {
  const qty = getProductStockQty(product);
  const threshold = product.lowStockThreshold ?? globalThreshold;
  const isOut = product.inStock === false || qty === 0;
  const isLow = !isOut && qty <= threshold;

  if (isOut) {
    return {
      qty,
      label: product.stockStatusText || 'স্টক আউট (০ ইউনিট)',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-900',
      badgeBorder: 'border-rose-300',
      isLow: true,
      isOut: true,
    };
  }

  if (isLow) {
    return {
      qty,
      label: `লো স্টক (${qty} ইউনিট বাকি)`,
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-950 font-bold',
      badgeBorder: 'border-amber-300',
      isLow: true,
      isOut: false,
    };
  }

  return {
    qty,
    label: `ইন স্টক (${qty} ইউনিট)`,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    isLow: false,
    isOut: false,
  };
}
