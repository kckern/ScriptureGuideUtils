
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

    var blacklist_pattern = new RegExp("(" + blacklist.join("|") + ")", 'g');

    return blacklist_pattern;
}

const preparePattern = (booklist,wordBreak,lang_extras) => {

    wordBreak = wordBreak || "";
    
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
    punct.push("\\s*[:\\-\\.–—]" + versenums); //[a-z]{0,1} //colons,dots and dashes
    punct.push("\\s*(?:" + chapter + "|" + verse + ")" + versenums); //spelled out chapter and verse words
    punct.push("\\s*(?:;|,|,* *and|&amp;|&| *to *)\\s*[1-9]\\d*(?!\\s*\\.*(" + numbooks.join("|") + "))"); //passage breakers (a new book may appear after)
    //add language overrides
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
    preparePattern
}