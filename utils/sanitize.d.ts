/**
 * Whether a URL is safe to place in an href or src.
 *
 * Relative URLs (no scheme) are allowed. Absolute URLs must use a known-safe
 * scheme — this is what keeps `javascript:` out.
 */
export declare function isSafeUrl(url: string, allowDataImage?: boolean): boolean;
/**
 * Strip anything that could execute from an HTML fragment.
 *
 * Parsed with DOMParser, which builds an inert document — no scripts run and
 * no resources load while we inspect it, unlike assigning to innerHTML.
 */
export declare function sanitizeContent(html: string): string;
