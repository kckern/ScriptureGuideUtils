/**
 * Enhanced contextual scripture reference detection module
 * Handles detection of implied references using context from explicit references
 */
import { findMatches, findMatchIndexes, processReferenceDetection } from './scriptdetect.mjs';
import {
    removeOverlaps,
    calculateGaps,
    calculateNegativeSpace,
    mergeAdjacentMatches,
    buildFinalOutput,
    gapCanMerge
} from './scriptlib.mjs';

// Context-aware collection: the positional core shared by the string-output
// detectReferencesWithContext and the public findReferences. Returns records:
//   { start, end, text, combinedText, verse_ids }
// where `text` is the verbatim span (content.slice(start,end) === text) used by
// DOM consumers, and `combinedText` is the joiner-normalized display string
// (e.g. "Jn 10.17–18;2 Nephi 2.8") used by the string-replacement callback.
// Returns [] when nothing resolves.
export const collectReferencesWithContext = (content, books, lang_extra, lookupReference, options) => {
    // Step 1: Find explicit references using existing logic
    // (findMatchIndexes returns false — not [] — when nothing matches)
    const explicitMatches = findMatches(content, books, lang_extra);
    const explicitIndices = findMatchIndexes(content, explicitMatches, lookupReference, lang_extra) || [];

    // Step 2: Find implied references using context
    const impliedMatches = findImpliedReferences(content, explicitMatches, explicitIndices, lookupReference, options);

    // Step 3: Merge and sort all matches - store both original text and verse IDs
    const explicitMatchesWithRefs = explicitIndices.map(([start, end]) => {
        const originalText = content.substring(start, end);
        const verification = lookupReference(originalText);
        return [start, end, originalText, verification.verse_ids];
    });

    // Convert implied matches to include verse IDs
    const impliedMatchesWithVerseIds = impliedMatches.map(([start, end, resolvedRef]) => {
        const originalText = content.substring(start, end);
        const verification = lookupReference(resolvedRef);
        return [start, end, originalText, verification.verse_ids];
    });

    const allMatches = [...explicitMatchesWithRefs, ...impliedMatchesWithVerseIds];
    allMatches.sort((a, b) => a[0] - b[0]);

    // Step 4: Remove overlaps, preferring explicit matches
    const nonOverlappingMatches = removeOverlaps(allMatches, content);

    if (!nonOverlappingMatches || nonOverlappingMatches.length === 0) {
        return [];
    }

    // Step 5: Merge adjacent matches whose gap is pure joiner material
    const gapsBetweenIndices = calculateGaps(nonOverlappingMatches);
    const joiners = lang_extra.joiners || ["^[;, &]$"];
    const gapThatMayBeMerged = gapsBetweenIndices.map(([start, end]) => {
        const gapString = content.substring(start, end).trim();
        return gapCanMerge(gapString, joiners);
    });

    // Explicit references listed with joiners express one grouped citation.
    const compatibilityCheck = () => true;
    const mergedIndices = mergeAdjacentMatches(nonOverlappingMatches, gapThatMayBeMerged, compatibilityCheck);

    return mergedIndices.map(([start, end, combinedText, verseIds]) => ({
        start,
        end,
        text: content.substring(start, end),
        combinedText,
        verse_ids: verseIds || []
    }));
};

// Enhanced reference detection with contextual processing (string output)
export const detectReferencesWithContext = (content, books, lang_extra, lookupReference, callback, options, generateReference = null) => {
    try {
        const records = collectReferencesWithContext(content, books, lang_extra, lookupReference, options);
        if (!records.length) return content;

        const indices = records.map(({ start, end }) => [start, end]);
        const negativeSpace = calculateNegativeSpace(indices, content.length);

        // Pass the joiner-normalized combinedText (not the verbatim span) to
        // preserve the established string-replacement display behavior.
        const cutItems = records.map(({ combinedText, verse_ids }) => callback(combinedText, verse_ids));
        const negativeItems = negativeSpace.map(([start, end]) => content.substring(start, end));
        const firstReferenceIsAtStart = indices[0][0] === 0;

        return buildFinalOutput(cutItems, negativeItems, firstReferenceIsAtStart);
    } catch (e) {
        console.warn('Enhanced reference detection failed, falling back to basic detection:', e);
        return processReferenceDetection(content, books, lang_extra, lookupReference, callback);
    }
};

/**
 * Find all book contexts from explicit references
 * @param {string} content - The text content
 * @param {Array} explicitMatches - Array of explicit reference strings
 * @param {Array} explicitIndices - Array of [start, end] positions for explicit matches
 * @param {Function} lookupReference - Function to validate references
 * @returns {Array} Array of context objects with book, chapter, and position info
 */
const findBookContexts = (content, explicitMatches, explicitIndices, lookupReference) => {
    const contexts = [];

    // Derive contexts from the positional spans themselves. (explicitMatches
    // is a differently-ordered/filtered string list — zipping the two arrays
    // by index paired wrong matches with wrong positions and crashed when
    // explicitIndices was false.)
    if (explicitIndices && explicitIndices.length) {
        for (let i = 0; i < explicitIndices.length; i++) {
            const [start, end] = explicitIndices[i];
            const match = content.substring(start, end);

            const verification = lookupReference(match);
            
            if (verification.verse_ids && verification.verse_ids.length > 0) {
                // Extract book and chapter from the verified reference
                // Handle both "Book Chapter:Verse" and "Book Chapter" (like D&C 76) patterns
                let refParts = verification.ref.match(/^(.+?)\s+(\d+):/);
                if (!refParts) {
                    // Try pattern for section-only references like "Doctrine and Covenants 76"
                    refParts = verification.ref.match(/^(.+?)\s+(\d+)$/);
                }
                
                if (refParts) {
                    const cleanBook = refParts[1];
                    const chapter = parseInt(refParts[2]);
                    
                    contexts.push({
                        position: start,
                        book: cleanBook,
                        chapter: chapter,
                        endPosition: end
                    });
                }
            }
        }
    }
    
    const result = contexts.sort((a, b) => a.position - b.position);
    return result;
};

/**
 * Get the nearest book context for a given position
 * @param {number} position - Character position in the text
 * @param {Array} bookContexts - Array of context objects from findBookContexts
 * @param {number} maxDistance - Maximum distance to look for context
 * @returns {Object|null} The nearest context object or null if none found
 */
const getNearestBookContext = (position, bookContexts, maxDistance) => {
    if (!bookContexts.length) return null;
    
    // Find the most recent context before this position
    let bestContext = null;
    let bestDistance = Infinity;
    
    for (const context of bookContexts) {
        if (context.position <= position) {
            const distance = position - context.endPosition;
            if (distance <= maxDistance && distance < bestDistance) {
                bestContext = context;
                bestDistance = distance;
            }
        }
    }
    
    return bestContext;
};

/**
 * Find implied references using context from explicit references
 * @param {string} content - The text content
 * @param {Array} explicitMatches - Array of explicit reference strings
 * @param {Array} explicitIndices - Array of [start, end] positions for explicit matches
 * @param {Function} lookupReference - Function to validate references
 * @param {Object} options - Detection options including maxContextDistance
 * @returns {Array} Array of [start, end, resolvedReference] tuples for implied references
 */
const findImpliedReferences = (content, explicitMatches, explicitIndices, lookupReference, options) => {
    const matches = [];
    
    // Find all explicit book references to establish context
    const bookContexts = findBookContexts(content, explicitMatches, explicitIndices, lookupReference);
    
    // Simple pattern to match "vv. X, Y, Z:A, B:C" - treat it as one unit
    const verseGroupPattern = /\b(?:vv?\.?\s*|vs\.?\s*|verses?\s+)([\d:,\s–—-]+?)(?=\s*[).;\n]|$)/gi;
    
    let match;
    while ((match = verseGroupPattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const verseSpec = match[1].trim();
        const position = match.index;
        
        // Find the nearest book context
        const context = getNearestBookContext(position, bookContexts, options.maxContextDistance);
        if (context) {
            // Replace the "vv." with the actual book and chapter
            const impliedRef = `${context.book} ${context.chapter}:${verseSpec}`;
            const verification = lookupReference(impliedRef);
            
            if (verification.verse_ids && verification.verse_ids.length > 0) {
                matches.push([position, position + fullMatch.length, impliedRef]);
            }
        }
    }
    
    // Also handle standalone chapter:verse patterns
    const chapterVersePattern = /\b(\d+):(\d+(?:[–—-]\d+)?(?:\s*,\s*\d+(?:[–—-]\d+)?)*)/g;
    while ((match = chapterVersePattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const chapter = match[1];
        const verses = match[2];
        const position = match.index;
        
        // Skip if this is part of an explicit reference we already found
        const isPartOfExplicit = explicitIndices && explicitIndices.some(([start, end]) => 
            position >= start && position < end
        );
        
        if (isPartOfExplicit) {
            continue;
        }
        
        // Find the nearest book context
        const context = getNearestBookContext(position, bookContexts, options.maxContextDistance);
        if (context) {
            const impliedRef = `${context.book} ${chapter}:${verses}`;
            const verification = lookupReference(impliedRef);
            
            if (verification.verse_ids && verification.verse_ids.length > 0) {
                matches.push([position, position + fullMatch.length, impliedRef]);
            }
        }
    }
    
    return matches;
};

export {
    findBookContexts,
    getNearestBookContext,
    findImpliedReferences
};
