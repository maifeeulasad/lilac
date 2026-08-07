// Find & replace matching engine.
//
// Deliberately pure and DOM-free so it can be unit-tested without mounting an
// editor. The editor's find panel walks the contenteditable's text nodes and
// applies these functions per node; see core/components/FindReplace.ts.
const escapeRegExp = (input) => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * Compile a search needle into a global RegExp, or null when the needle is
 * empty (an empty query matches nothing rather than everything).
 */
export function buildPattern(needle, options = {}) {
    if (!needle)
        return null;
    let source = escapeRegExp(needle);
    if (options.wholeWord)
        source = `\\b${source}\\b`;
    const flags = options.caseSensitive ? 'g' : 'gi';
    return new RegExp(source, flags);
}
/**
 * All non-overlapping matches of `needle` within `haystack`, left to right.
 */
export function findMatches(haystack, needle, options = {}) {
    const pattern = buildPattern(needle, options);
    const matches = [];
    if (!pattern)
        return matches;
    let match;
    while ((match = pattern.exec(haystack)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length });
        // A zero-length match (only reachable via a pathological pattern) would
        // spin forever; nudge lastIndex so exec always advances.
        if (pattern.lastIndex === match.index)
            pattern.lastIndex++;
    }
    return matches;
}
/** Number of matches without materializing them. */
export function countMatches(haystack, needle, options = {}) {
    return findMatches(haystack, needle, options).length;
}
/**
 * Replace every match of `needle` with `replacement`. The replacement is
 * inserted literally — unlike String.prototype.replace, `$&`, `$1`, etc. carry
 * no special meaning, so a user replacing "a" with "$&" gets a literal "$&".
 */
export function replaceAll(haystack, needle, replacement, options = {}) {
    const matches = findMatches(haystack, needle, options);
    if (matches.length === 0)
        return { text: haystack, count: 0 };
    let text = '';
    let cursor = 0;
    for (const { start, end } of matches) {
        text += haystack.slice(cursor, start) + replacement;
        cursor = end;
    }
    text += haystack.slice(cursor);
    return { text, count: matches.length };
}
