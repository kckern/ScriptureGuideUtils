const {lookupReference } = require("../scriptures.js");

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


const getReferencePositions = (content,booklist,lookupReference,wordBreak,lang_extras) =>
{
    var bookregex = booklist.map(b=>{
        return b[0];
    });

    const postBookMatch = "\\s*[0-9:;,~——–-][0-9:;, ~——–-]+"; //todo: spaces are allowed but not at the end
    //TODO, handle "chapter x Y"
    const matchingBooks = bookregex.filter(i=>(new RegExp(i,"ig")).test(content));
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
    },[]);
    
    
    //todo make unique
    const matchIndeces = matches.map(i=>{
        const instances = 1; //TODO: handle multple instances of same, 2D, then flatten
        const index = content.indexOf(i); 
        return [index,index+i.length];
    });

    
    const overLapReport = matchIndeces.map(inOut=>{
        const [inVal,outVal] = inOut;
        const overlaps = [];
        for(const inOutCompare of matchIndeces)
        {
            const [inVal2,outVal2] = inOutCompare;
            const overLapStart  = inVal < outVal2   && inVal > inVal2;
            const overLapEnd    = outVal > inVal2  && outVal < outVal2;
            if(overLapEnd || overLapStart) overlaps.push([inVal2,outVal2])
        }
        return {inOut,overlaps};
    });


    console.log(overLapReport);

    //double check bordering chars (word breaks, etc)

    //Detect overlaps
    const overlaps = [];
    const unique = [];
    for(const inOut of matchIndeces)
    {
    }
    //lookup verse_id
    //pare down if no verse_ids ( remove book ordinal, etc )  to replacements? "First Book of" => 1


    //If Overlaps, tiebreaker
    tieBreaker();


    //check content between matches.  If puctuation only (or 'and'), then merge

    const cutItems = matchIndeces.map(([start,end])=>{
        return lookupReference(content.substring(start,end));
    })


    console.log(content,matchIndeces,cutItems);
    process.exit();
}

const tieBreaker = (items)=>{


    // is one all lower case the other has uppercase?
            //lowecase loses
        
    // longer strlen wins

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
    getReferencePositions
}