export interface FindOptions {
    /** Match case exactly. Default false. */
    caseSensitive?: boolean;
    /** Only match on word boundaries (\b). Default false. */
    wholeWord?: boolean;
}
export interface FindMatch {
    /** Index of the first character of the match. */
    start: number;
    /** Index one past the last character of the match (exclusive). */
    end: number;
}
/**
 * Compile a search needle into a global RegExp, or null when the needle is
 * empty (an empty query matches nothing rather than everything).
 */
export declare function buildPattern(needle: string, options?: FindOptions): RegExp | null;
/**
 * All non-overlapping matches of `needle` within `haystack`, left to right.
 */
export declare function findMatches(haystack: string, needle: string, options?: FindOptions): FindMatch[];
/** Number of matches without materializing them. */
export declare function countMatches(haystack: string, needle: string, options?: FindOptions): number;
/**
 * Replace every match of `needle` with `replacement`. The replacement is
 * inserted literally — unlike String.prototype.replace, `$&`, `$1`, etc. carry
 * no special meaning, so a user replacing "a" with "$&" gets a literal "$&".
 */
export declare function replaceAll(haystack: string, needle: string, replacement: string, options?: FindOptions): {
    text: string;
    count: number;
};
