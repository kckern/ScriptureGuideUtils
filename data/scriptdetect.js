

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


const processReferenceDetection = (content,books,lang_extra,lookupReference,callback) =>
{
    const postBookMatch = "(?=.*\\S$)[0-9:;,~——–-\\s]+";  // Match numbers, 
    //TODO, handle "chapter x Y"
    const matchingBooks = books.filter(i=>(new RegExp(i,"ig")).test(content));

    const matchesWithReferences = matchingBooks.map(bookMatch=>{
        const patternString = bookMatch + postBookMatch;
        const pattern = (new RegExp(bookMatch + postBookMatch,"ig"));
        return pattern.test(content) ? patternString : null;
    }).filter(x=>!!x);
    //TODO: handle Pre-book numbers and words:  `the xth Book of`  get from lang_extras?

    const matches = matchesWithReferences.map(string=>{
        return content.match((new RegExp(string,"ig")))?.[0];
    }).map(i=>{
        return i.replace(/[^0-9]+$/,"");
    }).reduce((prev,current)=>{
        if(prev.includes(current)) return prev;
        return [...prev,current]
    },[]).filter(i=>!!i);
    

    const matchIndeces = matches.map(i=>{
        const instances = 1; //TODO: handle multple instances of same, 2D, then flatten
        const index = content.indexOf(i); 
        return [index,index+i.length];
    }).filter(a=>{
        const charRightBeforeMatch = content.substring(a[0]-1,a[0]);
        if(!!charRightBeforeMatch.trim()) return false; //make sure there is space or nothing before the match
        const verse_ids = lookupReference(content.substring(a[0],a[1])).verse_ids;
        if(verse_ids.length > 0) return true;
        return false;
    })
    .sort((a, b) => a[0] - b[0])



    if(!matchIndeces.length) return content;

    const tieBreaker = (pair1,pair2)=>{
        const string1 = content.substring(pair1[0],pair1[1]);
        const string2 = content.substring(pair2[0],pair2[1]);

        console.log(string1,string2);

        // if one pair is all lower case, return the other one
        if(/[^A-Z]/.test(string1) && !/[^A-Z]/.test(string2)) return pair2;
        if(/[^A-Z]/.test(string2) && !/[^A-Z]/.test(string1)) return pair1;

        if(string1.length > string2.length) return pair1;
        if(string2.length > string1.length) return pair2;

        return pair1;
    }


    const nonOverlappingIndeces = matchIndeces.reduce((prev, current) => {
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



    const gapsBetweenIndeces = nonOverlappingIndeces.reduce((prev,current,index)=>{
        if(index === 0) return prev;
        const lastPair = nonOverlappingIndeces[index-1];
        const gap = [lastPair[1],current[0]];
        return [...prev,gap];
    },[]);




    const joiners = [/^[;,]+$/g, /^et$/];
    const gapThatMayBeMerged = gapsBetweenIndeces.map(([start,end])=>{
        const string = content.substring(start,end);
        console.log(string);
        return joiners.some(joiner=>joiner.test(string.trim()));
    });



    // new incexes
    const mergedIndeces = nonOverlappingIndeces.reduce((prev, current, index) => {
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