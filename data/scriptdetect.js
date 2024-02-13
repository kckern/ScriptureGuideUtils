


const findMatchingBooks = (content,books) => {
    const matchingBooks = books.filter(i=>(new RegExp(i,"ig")).test(content));
    return matchingBooks;
}

const findMatches = (content,books,lang_extra) => {

    const tail = lang_extra.tail ? new RegExp(lang_extra.tail,"ig") : /[^0-9]+$/;
    const preBookMatch = lang_extra.book || `(First|I|1|1st|Second|II|2|2nd|Third|III|3|3rd|Fourth|IV|4|4th)*\\s*(books* of)*\\s*`;
    const matchingBooks = findMatchingBooks(content,books);
    const postBookMatch = lang_extra.chapter  || "([0-9:.;,~ —–-])*[0-9]+"; 
    const fullBookMatches = matchingBooks.map(bookMatch=>{
        const patternString =  preBookMatch + bookMatch ;
        const pattern = (new RegExp(patternString,"ig"));
        const stringMatch = pattern.test(content) ? patternString : null;
        //console.log({pattern,content,stringMatch});
        return stringMatch;
    }).filter(x=>!!x);


    const bookSubStrings = fullBookMatches.map(bookMatch=>{
        const matchCount = content.match(new RegExp(bookMatch,"ig")).length;
        const substrings = content.match(new RegExp(bookMatch,"ig")).flat();
        return substrings;
    }).flat().reduce((prev,current)=>{
        if(prev.includes(current)) return prev;
        return [...prev,current]
    },[]).filter(i=>!!i).map(substring=>{
        let positions = [];
        let index = content.indexOf(substring);
        while (index != -1) {
            positions.push(index);
            index = content.indexOf(substring, index + 1);
        }        return [substring,positions];
    });


    const possiblyOverlappingMatches = bookSubStrings.map(([substring,positions])=>{
        return positions.map(i=>{
            const pattern = new RegExp(substring+postBookMatch,"ig");
            const match = content.slice(i).match(pattern)?.[0]?.replace(tail,"").trim();
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
        const newString = content.slice(start,newEnd);
        return newString.replace(tail,"").trim();
    }).filter(i=>!!i);

    const matches =  matchesWithReferences.map(string=>{
        const pattern = (new RegExp(string,"ig"));
        const matches = content.match(pattern)?.map(i=>i.trim().replace(tail,""));
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
    const indexes =  matches.map(i=>{
        const length = i.length;
        let positions = [];
        let strPos = content.indexOf(i);

        while (strPos != -1) {
            positions.push(strPos);
            strPos = content.indexOf(i, strPos + 1);
        }
        return positions.map(i=>[i,i+length+2]);
    }).flat()
    .map(a=>{

        const substring = content.substring(a[0],a[1]).replace(tail,"").trim();
        const charRightBeforeMatch = content.substring(a[0]-1,a[0]);
        const leadingCharIsInvalid = !/^(\s|\W|)$/.test(charRightBeforeMatch);        
       // console.log({substring, charRightBeforeMatch, leadingCharIsInvalid});
        if(leadingCharIsInvalid) return false;        
        const verse_ids = lookupReference(substring).verse_ids;
         //console.log({a,substring,verse_ids});
        if(verse_ids.length > 0) return [a[0],a[0]+substring.length];

        return false;
    })
    .filter(i=>!!i)
    .sort((a, b) => a[0] - b[0]);



    if(!indexes.length) return false;


    const tieBreaker = (pair1,pair2)=>{
        const string1 = content.substring(pair1[0],pair1[1]);
        const string2 = content.substring(pair2[0],pair2[1]);

        // if one pair is all lower case, return the other one
        if(/[^A-Z]/.test(string1) && !/[^A-Z]/.test(string2)) return pair2;
        if(/[^A-Z]/.test(string2) && !/[^A-Z]/.test(string1)) return pair1;

        if(string1.length > string2.length) return pair1;
        if(string2.length > string1.length) return pair2;

        return pair1;
    }


    const nonOverlappingIndeces = indexes.reduce((prev, current) => {
        if (prev.length === 0) {
            return [current];
        }
        const lastPair = prev[prev.length - 1];
        if (current[0] < lastPair[1]) { // They overlap
            const chosenPair = tieBreaker(lastPair, current);
            if (chosenPair === lastPair) {
                // Keep the last pair, discard the current one
                return prev;
            } else {
                // Replace the last pair with the current one
                prev.pop();
                return [...prev, current];
            }
        } else {
            // They don't overlap, add the current pair
            return [...prev, current];
        }
    }, []);


    return nonOverlappingIndeces;



}





const processReferenceDetection = (content,books,lang_extra,lookupReference,callback) =>
{
    lang_extra = lang_extra || {};
    const matches = findMatches(content,books,lang_extra);
    

    const matchIndeces = findMatchIndexes(content,matches,lookupReference,lang_extra);
    if(!matchIndeces) return content;


    const gapsBetweenIndeces = matchIndeces.reduce((prev,current,index)=>{
        if(index === 0) return prev;
        const lastPair = matchIndeces[index-1];
        const gap = [lastPair[1],current[0]];
        return [...prev,gap];
    },[]);

    const gapStrings = gapsBetweenIndeces.map(([start,end])=>content.substring(start,end).trim());




    joiners = lang_extra.joiners || ["^[;, ]*(and|c\.*f\.*)*$"];
    const gapThatMayBeMerged = gapsBetweenIndeces.map(([start,end])=>{
        const string = content.substring(start,end).trim();
        const canBeMerged =  joiners.some(joiner=>(new RegExp(joiner,"ig")).test(string));
        return canBeMerged;
    });



    // new incexes
    const mergedIndeces = matchIndeces.reduce((prev, current, index) => {
        if (index === 0) {
            return [current];
        } else {
            const prevIndex = prev[prev.length - 1];
            if (gapThatMayBeMerged[index - 1]) {
                const merged = [prevIndex[0], current[1]];
                prev[prev.length - 1] = merged;
            } else {
                prev.push(current);
            }
            return prev;
        }
    }, []);

    //get the gaps and the front/end bumpers if any
    const negativeSpace = mergedIndeces.reduce((prev, current, index, array) => {
        if (index !== 0) {
            const prevIndex = array[index - 1];
            const gap = [prevIndex[1], current[0]];
            prev.push(gap);
        }
        return prev;
    }, []);

    if (mergedIndeces[0][0] !== 0) {
        negativeSpace.unshift([0, mergedIndeces[0][0]]);
    }

    if (mergedIndeces[mergedIndeces.length - 1][1] !== content.length) {
        negativeSpace.push([mergedIndeces[mergedIndeces.length - 1][1], content.length]);
    }


    //check content between matches.  If puctuation only (or 'and'), then merge

    const cutItems = mergedIndeces.map(([start,end])=>{
        return lookupReference(content.substring(start,end)).query
    }).map(callback);

   const negativeItems = negativeSpace.map(([start,end])=>content.substring(start,end));

   const firstReferenceIsAtStart = mergedIndeces[0][0] === 0;
   const maxCount = Math.max(cutItems.length,negativeItems.length);
   //merge by alternating cutItems and negativeItems.  run the callback on the cut items
   const merged = [];

   for(i=0;i<maxCount;i++){
    const firstItem = firstReferenceIsAtStart ? cutItems[i] : negativeItems[i];
    const secondItem = firstReferenceIsAtStart ? negativeItems[i] : cutItems[i];
    if(firstItem) merged.push(firstItem);
    if(secondItem) merged.push(secondItem);
   }


   return merged.join("");

    
}



module.exports = {
    processReferenceDetection
}