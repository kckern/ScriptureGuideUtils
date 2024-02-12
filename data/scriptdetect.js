

const prepareBlacklist = (lang_extras) => {
    var blacklist = [];
    blacklist.push("\\d{4,}");                          // 4 Digit references
    blacklist.push("^Ch\\. \\d+");                      //Chapter with no book
    blacklist.push("\\w\\w\\d\\d");                     //Words with numbers together KGURO43KEAJFK

    //Oneoff Blacklist
    blacklist.push("\\bro \\d+\\b");                          //lowecase letters followed by numbers   
    blacklist.push("\\bETH \\d+\.\\d+\\b");
    blacklist.push("\\b(BC|AD|BCE)[––—−]+\\d+\\b");           //550 BC–330 BC
    blacklist.push("\\b(AC3|PS2|PS3|PS4)\\b");                //Common file extentions
    blacklist.push("\\b(ps|PS)[1-9]\\b");                     //Common file extentions'

    //Increase strictness for abbreviations
    blacklist.push("\\b[a-z][a-z] [0-9]");                    //lowercase 2-letter abbreviation


    var blacklist_pattern = new RegExp("(" + blacklist.join("|") + ")", 'g');

    return blacklist_pattern;
}


const findMatchingBooks = (content,books) => {
    const matchingBooks = books.filter(i=>(new RegExp(i,"ig")).test(content));
    return matchingBooks;
}

const findMatches = (content,books,lang_extra) => {

    const preBookMatch = lang_extra.book || `(First|I|1|1st|Second|II|2|2nd|Third|III|3|3rd|Fourth|IV|4|4th)*\\s*(books* of)*\\s*`;
    const matchingBooks = findMatchingBooks(content,books);
    const postBookMatch = lang_extra.chapter  || "([0-9:.;,~ —–-])*[0-9]+"; 
    const matchesWithReferences = matchingBooks.map(bookMatch=>{
        const patternString =  preBookMatch + bookMatch + postBookMatch;
        const pattern = (new RegExp(patternString,"ig"));
        const stringMatch = pattern.test(content) ? patternString : null;
        //console.log({pattern,content,stringMatch});
        return stringMatch;
    }).filter(x=>!!x);

    

    // Ensure the match ends with a number
    // Also remove duplicates that may have been created by the postBookMatch
    return matchesWithReferences.map(string=>{
        const pattern = (new RegExp(string,"ig"));
        const tail = lang_extra.tail || /[^0-9]+$/;
        const matches = content.match(pattern)?.map(i=>i.trim().replace(tail,""));
        return matches;
    }).flat()
    .reduce((prev,current)=>{
        if(prev.includes(current)) return prev;
        return [...prev,current]
    },[]).filter(i=>!!i);




    //TODO: Process on a language by language basis
    // 2. Prebook JST
    // 3. Prechapter (, chapter, ch)
    // 4. Preverse (, verse, v, vv, vv, vvv)
    // 5. Joiners (,;and, &, cf, etc)
}



function findMatchIndexes(content, matches,lookupReference) {
    const indexes =  matches.map(i=>{
        const length = i.length;
        let positions = [];
        let strPos = content.indexOf(i);
        while (strPos != -1) {
            positions.push(strPos);
            strPos = content.indexOf(i, strPos + 1);
        }
        return positions.map(i=>[i,i+length]);
    }).flat()
    .filter(a=>{

        const substring = content.substring(a[0],a[1]);
        const charRightBeforeMatch = content.substring(a[0]-1,a[0]);
        if(!/(^|\s|\W)/.test(charRightBeforeMatch)) return false;        
        const verse_ids = lookupReference(substring).verse_ids;
        // console.log({a,substring,verse_ids});
        if(verse_ids.length > 0) return true;


        return false;
    })
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


    const matchIndeces = findMatchIndexes(content,matches,lookupReference);
    if(!matchIndeces) return content;


    const gapsBetweenIndeces = matchIndeces.reduce((prev,current,index)=>{
        if(index === 0) return prev;
        const lastPair = matchIndeces[index-1];
        const gap = [lastPair[1],current[0]];
        return [...prev,gap];
    },[]);




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


const preparePattern = (booklist,wordBreak,lang_extras) => {


    wordBreak = wordBreak || "";
    lang_chapter = lang_extras?.chapter || "";
    lang_verse = lang_extras?.verse || "";
    
     var bookregex = booklist.map(b=>{
         return b[0];
     });
    
    //Combine Books
    const books = "(?:" + bookregex.join("|") + ")\\s*"; //   \\(*
    
    //Books that have a digit before them
    var numbooks = [];
    numbooks.push("ne");
    numbooks.push("sam");
    numbooks.push("ki*n*gs");
    numbooks.push("chr");
    numbooks.push("cor");
    numbooks.push("ti");
    numbooks.push("thes");
    numbooks.push("pet");
    numbooks.push("jo*h*n");
    
    
    //Meta data components
    var jst = "(?:[, —\\-]*(?:Joseph Smith[']*s* Translation *o*f*|\\(Joseph Smith[']*s* Translation *o*f*\\)|jst|\\(jst\\))[, \\—\\-)]*)*";
    var ordinals = `(?:[I1-4]*(?:3rd|1st|2n*d|4th|first|sec*o*n*d*\\.*|third|fourt*h*)* *${wordBreak})*`;
    var booksof = "(?:\\s*books* of\\s*)*";
    var prechapter = "(?:\\s|\\-|–|,)*";
    var chapter = `(?:,*\\s*` + ordinals + `${wordBreak}cha*p*t*e*r*s*\\.*,*\\s*)`;
    var verse = `(?:,*\\s*` + ordinals + `${wordBreak}v*ve*r*s*e*s*\\.*,*\\s*)`;
    var versenums = "\\s*[0-9]+"; //[a-f]*
    var joiners = "(?:[,;&\\/](?:\\s*and\\s*)*\\s*(?!$))*";
    var bumper = "(?![^<>]*>)"; //prevents matching inside of quotes


    //Punctuations, etc
    var punct = [];
    punct.push("\\s*[:\\-\\.~–—]" + versenums); //[a-z]{0,1} //colons,dots and dashes
    punct.push("\\s*(?:" + chapter + "|" + verse + ")" + versenums); //spelled out chapter and verse words
    punct.push("\\s*(?:;|,|,* *and|&amp;|&| *to *)\\s*[1-9]\\d*(?!\\s*\\.*(" + numbooks.join("|") + "))"); //passage breakers (a new book may appear after)
    //add language overrides
    if(lang_chapter) punct.push(lang_chapter);
    if(lang_verse) punct.push(lang_verse);
    //if(Array.isArray(lang_extras)) punct = [...punct, ...lang_extras];

    //combine punctuation
    var punct = "(?:[1-9]\\d*(?:" + punct.join("|") + ")*)";
    
    //Full Regex
    var match = bumper + "((?:(?:" + jst + `${wordBreak}` + ordinals + booksof + books + prechapter + chapter + "*" + punct + jst + ")" + joiners + ")+)";
    var pattern = new RegExp(match, 'gi');

    return pattern;

}


module.exports = {
    prepareBlacklist,
    preparePattern,
    processReferenceDetection
}