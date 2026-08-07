import type { FormatCommand, ToolbarTool } from '../types/index.js';
export declare const formatCommands: Record<ToolbarTool, FormatCommand | null>;
export declare function executeFormatCommand(tool: ToolbarTool, value?: string): boolean;
export declare function isFormatActive(tool: ToolbarTool): boolean;
export declare function getActiveFormats(tools: ToolbarTool[]): Set<ToolbarTool>;
export declare function insertLink(url: string, text?: string): boolean;
export declare function insertImage(src: string, alt?: string): boolean;
export declare const keyboardShortcuts: Record<string, ToolbarTool>;
export declare function getShortcutKey(event: KeyboardEvent): string | null;
export declare function cn(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string;
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void;
export declare function isValidUrl(string: string): boolean;
/**
 * Escape a string so it renders as literal text rather than markup.
 *
 * Note this is NOT a sanitizer — it escapes everything, so passing editor
 * content through it renders `&lt;p&gt;Hello&lt;/p&gt;` as visible text and
 * destroys all formatting. To strip dangerous markup while keeping formatting,
 * use `sanitizeContent` from './sanitize.js'.
 */
export declare function escapeHtml(html: string): string;
/**
 * @deprecated Misleading name — this escapes rather than sanitizes. Use
 * `escapeHtml` if you want escaping, or `sanitizeContent` if you want to
 * strip dangerous markup while preserving formatting.
 */
export declare const sanitizeHtml: typeof escapeHtml;
export declare function extractTextFromHtml(html: string): string;
