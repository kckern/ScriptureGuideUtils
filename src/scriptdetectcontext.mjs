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
    buildFinalOutput 
} from './scriptlib.mjs';

// Enhanced reference detection with contextual processing
export const detectReferencesWithContext = (content, books, lang_extra, lookupReference, callback, options, generateReference = null) => {
    try {
        // Step 1: Find explicit references using existing logic
        const explicitMatches = findMatches(content, books, lang_extra);
        const explicitIndices = findMatchIndexes(content, explicitMatches, lookupReference, lang_extra);
        
        // Step 2: Find implied references using context
        const impliedMatches = findImpliedReferences(content, explicitMatches, explicitIndices, lookupReference, options);
        
        // Step 3: Merge and sort all matches - store both original text and verse IDs
        const explicitMatchesWithRefs = (explicitIndices || []).map(([start, end]) => {
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
            return content;
        }
        
        // Step 5: Apply the same gap merging logic as original
        const gapsBetweenIndices = calculateGaps(nonOverlappingMatches);
        
        const joiners = lang_extra.joiners || ["^[;]*(and|cf\\.)*$", "^\\s*[;,]\\s*$"];  // More restrictive joiners
        const gapThatMayBeMerged = gapsBetweenIndices.map(([start, end]) => {
            const gapString = content.substring(start, end).trim();
            return joiners.some(joiner => (new RegExp(joiner, "ig")).test(gapString));
        });
        
        // Compatibility check for merging references
        const compatibilityCheck = (prevIndex, current) => {
            if (!prevIndex[3] || !current[3]) return true; // Allow merge if no verse IDs
            if (!generateReference) return true; // Allow merge if no generateReference function
            
            // For implied references, we need to generate the reference from verse IDs to compare
            const prevRefText = generateReference(prevIndex[3]) || prevIndex[2];
            const currentRefText = generateReference(current[3]) || current[2];
            
            // Extract book and chapter from references
            const prevParts = prevRefText.match(/^(.+?)\s+(\d+):/);
            const currentParts = currentRefText.match(/^(.+?)\s+(\d+):/);
            
            if (prevParts && currentParts) {
                const prevBook = prevParts[1];
                const prevChapter = prevParts[2];
                const currentBook = currentParts[1];
                const currentChapter = currentParts[2];
                
                // Don't merge if different books or chapters
                return prevBook === currentBook && prevChapter === currentChapter;
            }
            
            return true;
        };
        
        // Merge adjacent matches if gaps are joiners and references are compatible
        const mergedIndices = mergeAdjacentMatches(nonOverlappingMatches, gapThatMayBeMerged, compatibilityCheck);
        
        // Step 6: Build final output
        const negativeSpace = calculateNegativeSpace(mergedIndices, content.length);
        
        // Use the stored reference and verse IDs
        const cutItems = mergedIndices.map(([start, end, originalText, verseIds]) => {
            // Generate the rendered reference from verse IDs
            const renderedText = generateReference ? generateReference(verseIds) : originalText;
            return callback(originalText, renderedText);
        });
        
        const negativeItems = negativeSpace.map(([start, end]) => content.substring(start, end));
        const firstReferenceIsAtStart = mergedIndices[0][0] === 0;
        
        const result = buildFinalOutput(cutItems, negativeItems, firstReferenceIsAtStart);
        return result;
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
    
    // Use the already found explicit matches and their positions
    if (explicitMatches && explicitIndices) {
        for (let i = 0; i < explicitMatches.length; i++) {
            const match = explicitMatches[i];
            const [start, end] = explicitIndices[i];
            
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
