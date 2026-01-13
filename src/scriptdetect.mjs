


import { removeOverlaps, calculateGaps, calculateNegativeSpace, mergeAdjacentMatches, buildFinalOutput, defaultTieBreaker } from './scriptlib.mjs';

const findMatchingBooks = (content,books) => {
    const matchingBooks = books.filter(i=>(new RegExp(i,"ig")).test(content));
    return matchingBooks;
}

const findMatches = (content,books,lang_extra) => {
    // Pre-process content to normalize HTML entities to Unicode dashes
    const htmlEntityMap = {
        '&ndash;': '–',
        '&mdash;': '—', 
        '&minus;': '−',
        '&#8211;': '–',
        '&#8212;': '—',
        '&#8722;': '−'
    };
    
    let normalizedContent = content;
    Object.entries(htmlEntityMap).forEach(([entity, unicode]) => {
        normalizedContent = normalizedContent.replace(new RegExp(entity, 'g'), unicode);
    });

    const tail = lang_extra.tail ? new RegExp(lang_extra.tail,"ig") : /[^0-9]+$/;
    const preBookMatch = lang_extra.book || `(First|I|1|1st|Second|II|2|2nd|Third|III|3|3rd|Fourth|IV|4|4th)*\\s*(books* of)*\\s*`;
    const matchingBooks = findMatchingBooks(normalizedContent,books);
    const postBookMatch = lang_extra.chapter || "([0-9:.;,~ —–-]|cf)*[0-9]+";
    const fullBookMatches = matchingBooks.map(bookMatch=>{
        const patternString =  preBookMatch + bookMatch ;
        const pattern = (new RegExp(patternString,"ig"));
        const stringMatch = pattern.test(normalizedContent) ? patternString : null;
        //console.log({pattern,content,stringMatch});
        return stringMatch;
    }).filter(x=>!!x);

    const bookSubStrings = fullBookMatches.map(bookMatch=>{
        const substrings = normalizedContent.match(new RegExp(bookMatch,"ig")).flat();
        return substrings;
    }).flat().reduce((prev,current)=>{
        if(prev.includes(current)) return prev;
        return [...prev,current]
    },[]).filter(i=>!!i).map(substring=>{
        substring = substring.trim();
        let positions = [];
        let index = normalizedContent.indexOf(substring);
        while (index !== -1) {
            positions.push(index);
            index = normalizedContent.indexOf(substring, index + 1);
        }        return [substring,positions];
    }).map(([substring,positions])=>{
        const preChars = positions.map(i=>normalizedContent.substring(i-1,i));
        positions = positions.filter((i,index)=>{
            const charRightBeforeMatch = preChars[index];
            const leadingCharIsInvalid = !/^(\s|\W|)$/.test(charRightBeforeMatch);  
            return !leadingCharIsInvalid;
        });
        if(!positions.length) return false;
        return [substring,positions];
    }).filter(i=>!!i);

    const possiblyOverlappingMatches = bookSubStrings.map(([substring,positions])=>{
        return positions.map(i=>{
            let pattern = null;
            try{
               pattern = new RegExp(substring+postBookMatch,"ig");
            }catch(e){
                return null;
            }
            const match = normalizedContent.slice(i).match(pattern)?.[0]?.replace(tail,"").trim();
            if(!match) return null;
            const len = match.length;
            const pos = i;
            const [posIn, posOut] = [pos,pos+len];
            //console.log({content:content.slice(i),pattern,match,posIn,posOut});
            return [match,posIn,posOut];
        }
    )}).flat().filter(i=>!!i);
    const matchesWithReferences = possiblyOverlappingMatches.map(([string,start,end])=>{
        const overLappingItems = possiblyOverlappingMatches.filter(([s,s1,e1])=>s!==string && s1<end && e1>end);
        const hasOverlap = overLappingItems.length > 0;
        const newEnd = hasOverlap ? Math.min(...overLappingItems.map(([s,s1,e1])=>s1)) : end;
        const newString = normalizedContent.slice(start,newEnd);
        return newString.replace(tail,"").trim();
    }).filter(i=>!!i);
    const matches =  matchesWithReferences.map(string=>{
        const pattern = (new RegExp(string,"ig"));
        const matches = normalizedContent.match(pattern)?.map(i=>i.trim().replace(tail,""));
        //console.log({string,matches,tail});
        return matches;
    }).flat()
    .reduce((prev,current)=>{
        if(prev.includes(current)) return prev;
        return [...prev,current]
    },[]).filter(i=>!!i);
    return matches;
}



function findMatchIndexes(content, matches,lookupReference, lang_extra) {
    const tail = lang_extra.tail ? new RegExp(lang_extra.tail,"ig") : /[^0-9]+$/;
    const indexes =  matches
    .sort((b, a) => b.length - a.length)
    .map(i=>{
        const length = i.length;
        let positions = [];
        let strPos = content.indexOf(i);

        while (strPos !== -1) {
            positions.push(strPos);
            strPos = content.indexOf(i, strPos + 1);
        }
        return positions.map(i=>[i,i+length+2]);
    }).flat()
    .map(a=>{

        const substring = content.substring(a[0],a[1]).trim().replace(tail,"").trim();
        if(!substring) return false;
        const verse_ids = lookupReference(substring).verse_ids;
        //console.log({substring,verse_ids});
        if(verse_ids.length > 0) return [a[0],a[0]+substring.length];

        return false;
    })
    .filter(i=>!!i)
    .sort((a, b) => a[0] - b[0])
    .map(([start, end], index, array) => {
        const nextStart = array[index+1]?.[0] || null;
        end = nextStart ? Math.min(end,nextStart) : end;
        return [start,end];
    });

    if(!indexes.length) return false;

    // Use shared overlap removal with custom tie-breaker
    const preferenceResolver = (pair1, pair2, content) => defaultTieBreaker(pair1, pair2, content);
    const nonOverlappingIndeces = removeOverlaps(indexes, content, preferenceResolver)
        .filter(([start,end])=>start!==end);

    return nonOverlappingIndeces;



}





const processReferenceDetection = (content,books,lang_extra,lookupReference,callback) =>
{
    try{
    lang_extra = lang_extra || {};
    const matches = findMatches(content,books,lang_extra);
    const matchIndeces = findMatchIndexes(content,matches,lookupReference,lang_extra);
    if(!matchIndeces) return content;
    
    const gapsBetweenIndeces = calculateGaps(matchIndeces);
    const gapStrings = gapsBetweenIndeces.map(([start,end])=>content.substring(start,end).trim());
    //console.log({matches,matchIndeces,gapsBetweenIndeces,gapStrings});
    const joiners = lang_extra.joiners || ["^[;, &]*(and|c\\.*f\\.*|&|cited\\s+at|see\\s+also|compare|cf|see)*\\s*$"];
    const gapThatMayBeMerged = gapsBetweenIndeces.map(([start,end],i)=>{
        const gapString = gapStrings[i];
        const canBeMerged =  joiners.some(joiner=>(new RegExp(joiner,"ig")).test(gapString));
        const matchingJoiner = joiners.find(joiner=>(new RegExp(joiner,"ig")).test(gapString));
        //console.log({gapString,matchingJoiner});
        return canBeMerged;
    });

    // Use shared merge logic
    const mergedIndeces = mergeAdjacentMatches(matchIndeces, gapThatMayBeMerged);

    // Use shared negative space calculation
    const negativeSpace = calculateNegativeSpace(mergedIndeces, content.length);

    //check content between matches.  If puctuation only (or 'and'), then merge
    const cutItems = mergedIndeces.map(([start,end])=>{
        const string = content.substring(start,end);
        const lookupResult = lookupReference(string);
        return callback(lookupResult.query, lookupResult.verse_ids);
    });

   const negativeItems = negativeSpace.map(([start,end])=>content.substring(start,end));
   const firstReferenceIsAtStart = mergedIndeces[0][0] === 0;
   
   return buildFinalOutput(cutItems, negativeItems, firstReferenceIsAtStart);
    }catch(e){
        return content;
    }
}



export {
    processReferenceDetection,
    findMatches,
    findMatchIndexes
}