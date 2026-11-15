// Meta Pixel helper. The pixel itself is loaded in src/index.html.
declare const fbq: ((...args: unknown[]) => void) | undefined;

export const PIXEL_CURRENCY = 'TND';

export function trackPixel(event: string, params?: Record<string, unknown>) {
  // fbq is missing when an ad blocker blocks the pixel script
  if (typeof fbq === 'function') {
    fbq('track', event, params);
  }
}
