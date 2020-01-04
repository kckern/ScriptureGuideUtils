
const scriptindex = require("./scriptindex.js")

const cleanReference = function (messyReference) {

    let ref = messyReference.trim();

    //Stray text cleanup
    ref = ref.replace(/[.]{2,}/, ';');
    ref = ref.replace(/(\d+) (\d+)/i, '$1.$2');

    if (false) console.log("fix") // TODO Process Numeric for direct vid lookup

    //Fix strange whitespace encoding
    ref = ref.replace(decodeURIComponent('%C2%A0'), ' ');


    //Remove Leading Zeros
    ref = ref.replace(/([a-z])[ .-]*0+/i, '$1');
    ref = ref.replace(/^(\d+)-/i, '$1');


    //Build Regex rules

    let regex = [
        //Standardize JST


        //Turn spelled-out ordinals into pure numbers
        ["(first|1st|\\bi\\b)", "1"],
        ["(second|2nd|\\bii\\b)", "2"],
        ["(third|3rd|\\biii\\b)", "3"],
        ["(fourth|4th|\\biv\\b)", "4"],
        ["([0-9])th\\b", "$1"],
        ["([1-4])(st|nd|d|rd|th)\\b", "$1"],

        //Remove spelled out word chapter
        [",*\\s*\\b(?:ch\\b|chap(?:t*er)*s*)\\.*\\,*\\s*(\\d+)", "$1"],
        [",*\\s*\\b(?:sec\\b|section)\\.*\\s*(\\d+)", "$1"],
        ["([0-9]),*\\s*\\b(?:chapt*ers*|ch|chptrs*)\\.*,*\\s*([0-9])", "$1:$2"],
        ["([a-z]),*\\s*\\b(?:chapt*ers*|ch|chptrs*)\\s*([0-9])", "$1 $2"],


        //Punctuation standardization
        ["[()]+", " "],  //remove parentheses
        ["[\\s.]*[–—−\\-]+[\\s.]*", "-"], //standardize hyphens and dashes
        ["([;,])\\s*and\\s*", "$1"],
        ["([0-9])[ .]*and[ .]*", "$1,"],
        ["(\\d)(\\.|: )(\\d)", "$1:$3"],
        ["\\s+(\\d+)[-–—](\\d+:\\d+)", " $1:1-$2"],
        ["(\\d)([A-Z])", "$1 $2"],
        ["(\\d) ([A-Z])$", "$1$2"],
        ["([0-9]),\\s*([1-4]*\\s*[a-z])", "$1; $2"],
        ["([a-z]), ([0-9])", "$1 $2"],  //remove comma after book or chapter
        ["\\.", " "],  //Dots to spaces
        [" - ", " "],  //Dots to spaces
        ["; ", ";"],  //Dots to spaces
        [": ", ":"],  //Dots to spaces
        ["(\\D)-(\\d)", "$1 $2"],  //Dots to spaces
        ["([a-z]),", "$1"],  //Dots to spaces

        ["jst(,| of )", "JST "],  //remove parentheses
        ["jst([a-z])", "JST $1"],  //remove parentheses

        [",\\s*((?:\\d+\\s)*[a-z])", "; $1"],
        ["\\b\\s*cf\\.*\\s*\\b", "; "],


        //Convert spelled out verses
        ["\\bv*ve*r*s*e*s*\\s*([0-9])", ":$1"],
        ["(, *)*\\bverses*\\s*([0-9])", ":$1"],
        ["\\s*:", ":"],  //space before colon
        [";\\s*:", ":"],
        ["(\\d+) *to *(\\d+)", "$1-$2"], //standardize hyphens and dashes

        //Capitalization and emdash
        ["([—-])h", "\u2014H"],
        ["([—-])m", "\u2014M"],

        //Add Space before digit
        ["([A-za-z])(\\d)", "$1 $2"],
        //Turn comma divider indo semicolon divider
        ["([0-9]),\\s*([1-4]*\\s*[a-z])", "$1; $2"],

        //unabreviate on/of
        ["o([nf])", "o$1"],
        ["([;,])", "$1 "],
        ["(the )*book of", ""]
    ];

    for (let i in regex) {
        var re = new RegExp(regex[i][0], "ig");
        ref = ref.replace(re, regex[i][1]);
    }

    regex = [
        //Old Testament
        ["gen\\.*(?:esis)*", "Genesis"],
        ["exo*\\.*(?:dus)*", "Exodus"],
        ["levi*t*\\.*(?:icus)*", "Leviticus"],
        ["num\\.*(?:bers)*", "Numbers"],
        ["deut\\.*(?:eronomy)*", "Deuteronomy"],
        ["josh\\.*(?:ua)*", "Joshua"],
        ["judg\\.*(?:es)*", "Judges"],
        ["rut*h*\\.*", "Ruth"],
        ["sam*u*\\.*(?:el)*", "Samuel"],
        ["ki*n*gs*\\.*", "Kings"],
        ["chr*o*n*\\.*(?:icles)*", "Chronicles"],
        ["ezr*\\.*(?:a)*", "Ezra"],
        ["neh\\.*(?:emiah)*", "Nehemiah"],
        ["esth*\\.*(?:er)*", "Esther"],
        ["job", "Job"],
        ["ps\\.*(?:a)*\\.*(?:lm)*\\.*(?:s)*", "Psalms"],
        ["prov\\.*(?:erbs)*", "Proverbs"],
        ["eccl*\\.*(?:esiastes)*", "Ecclesiastes"],
        ["(the )*song*\\.*(?: of solomon)*", "Solomon's Song"],
        ["isa\\.*(?:iah)*", "Isaiah"],
        ["jer\\.*(?:emiah)*", "Jeremiah"],
        ["lame*n*t*\\.*(?:ations)*", "Lamentations"],
        ["eze*k*\\.*(?:iel)*", "Ezekiel"],
        ["dan\\.*(?:iel)*", "Daniel"],
        ["hos*\\.*(?:ea)*", "Hosea"],
        ["joel*\\.*", "Joel"],
        ["amos*\\.*", "Amos"],
        ["obad\\.*(?:iah)*", "Obadiah"],
        ["jon*\\.*(?:ah)*", "Jonah"],
        ["mic*\\.*(?:ah)*", "Micah"],
        ["nah*\\.*(?:um)*", "Nahum"],
        ["hab*\\.*(?:akuk)*", "Habakkuk"],
        ["zeph*\\.*(?:aniah)*", "Zephaniah"],
        ["hag\\.*(?:gai)*", "Haggai"],
        ["zech*\\.*(?:ariah)*", "Zechariah"],
        ["mal*\\.*(?:achi)*", "Malachi"],


        //New Testament
        ["(?:ma*t*t*h*|mt)\\.*(?:ew)*", "Matthew"],
        ["m(ar)*k", "Mark"],
        ["lu*k*e*\\.*", "Luke"],
        ["jo*h*n\\.*", "John"],
        ["(?:the )*act*s*\\.*(?: of the apostles)*", "Acts"],
        ["rom*\\.*(?:ans)*", "Romans"],
        ["cor\\.*(?:inthians)*", "Corinthians"],
        ["gal*a*\\.*(?:tians)*", "Galatians"],
        ["ephe*\\.*(?:sians)*", "Ephesians"],
        ["phili*p*\\.*(?:ippians)*", "Philippians"],
        ["colo*s*\\.*(?:sians)*", "Colossians"],
        ["thess*\\.*(?:alonians)*", "Thessalonians"],
        ["tim\\.*(?:othy)*", "Timothy"],
        ["tit*\\.*(?:us)*", "Titus"],
        ["philem*o*n*\\.*", "Philemon"],
        ["he\\.*(?:b)*\\.*(?:rews)*", "Hebrews"],
        ["ja\\.*(?:me)*s", "James"],
        ["pet*\\.*(?:er)*", "Peter"],
        ["ju\\.*(?:d)*\\.*(?:e)*", "Jude"],
        ["rev\\.*(?:elation)*", "Revelation"],


        //Book of Mormon
        ["ne\\.*(?:phi)*", "Nephi"],
        ["jac\\.*(?:ob)*", "Jacob"],
        ["en\\.*(?:os)*", "Enos"],
        ["jar\\.*(?:om)*", "Jarom"],
        ["om\\.*(?:ni)*", "Omni"],
        ["(?:the *)*w(?:ords)*[ _-]*o[ _-f]*m(?:ormon)*", "Words of Mormon"],
        ["mos\\.*(?:iah)*", "Mosiah"],
        ["alma", "Alma"],
        ["hela*\\.*(?:a*man)*", "Helaman"],
        ["eth\\.*(?:er)*", "Ether"],
        ["morm\\.*(?:on)*", "Mormon"],
        ["moro\\.*(?:ni)*", "Moroni"],


        //D&C
        ["d(?:octrine)*\\.* *(?:&amp;|&|and)* *c(?:ovenants)*(?:\\s*\\bSec(?:tion)*)*\\.*", "Doctrine and Covenants"],
        ["dee and see", "Doctrine and Covenants"], // for voice command


        //Pearl of Great Price
        ["Moses", "Moses"],
        ["Abra*\\.*(?:ham)*", "Abraham"],
        ["Jos(?:eph)*\\.* Smith(?:[–—\\- ]+Matthew)", "Joseph Smith\u2014Matthew"],
        ["Jos(?:eph)*\\.* Smith(?:[–—\\- ]+History)", "Joseph Smith\u2014History"],
        ["JS[—\\-]*\\s*[H]", "Joseph Smith History"],
        ["JS[—\\-]*\\s*[M]", "Joseph Smith Matthew"],
        ["a(?:rticles)*[ _-]*o[ _-f]*f(?:aith)*", "Articles of Faith"],


        //Other Mormon Scripture
        [",* *jst", "JST"], //remove comma in front of jst
        ["Jos(eph)*\\.* Smith('s)* Translation,*( of)*\\s*", "JST"], //abbreviate
        ["([^;-]*?)\\s*jst\\s*", "JST $1"], //ange order if behind
        ["JST *,*[ —-]+", "JST "], //change order if behind
        ["JST Genesis 0", "Moses 1"],
        ["lect*(?:ures*)*(?: on faith)*\\.*", "Lectures on Faith"],
        ["l[ _-]*o*[ _-n]*f", "Lectures on Faith"],
        ["bo*c\\s*(\\d+)", "Book of Commandments $1"],
        ["(?:book of )*com(?:mandments)*", "Book of Commandments"],
        ["l *on* *f", "Lectures on Faith"],
        ["lec\\.*(?:tures*)(?: on faith)*", "Lectures on Faith"],


        //Strangite
        ["(?:the )*(?:book of )*(?:the )*Law of the Lord", "Law"],
        ["Law", "The Law of the Lord"],


        //MW&W
        ["tsp", "The Sealed Portion"],
        ["the sealed portion", "The Sealed Portion"],
        ["1\\s*(?:st)*\\s*v(?:ision)*", "First Vision"],


        //Coc
        ["W\\s*Moroni", "Words of Moroni"],
        ["s(?:ealed)*.*?moses", "Sealed Book of Moses"],
        ["3.*ne(phi)*(te)*.*?acts", "Acts of the Three Nephites"],


        //Islam
        ["qur['’ ]*(an)*", "Qur’an"],
        ["(?:al[ \\-––])*qur'*’*ani*c*(?:verses*)*", "Qur’an"],
        ["surah [a-z\\-–’']*(?: |:|–|\\-|v|vv|verses*)*", "Qur’an"],
        ["al[ \\-–][a-z\\-–’']+(?: |:|–|\\-|v|vv|verses*|ayab)*", "Qur’an"],
        ["kor(an)*", "Qur’an"],


        //Eastern
        ["dh*p(ada)*", "Dhammapada"],
        ["d(ha|ah)mm*(apada)*", "Dhammapada"],
        ["b*h*(agavad)* *g(ita)*", "Bhagavad Gita"],
        ["tao( *te* *ching)*", "Tao Te Ching"],
        //deal with high verses


        //Utils for One-off Errors
        ["(Book of )+", "Book of "],
        ["( on Faith)+", " on Faith"],
        ["(Solomon's )+", "Solomon's "],

    ];

    //process book Fixes
    for (let i in regex) {
        var re = new RegExp("\\b" + regex[i][0] + "\\.*\\b", "ig");
        ref = ref.replace(re, regex[i][1]);
    }


    //Default to 1st chapter
    ref = ref.replace(/(Words of Mormon|Articles of Faith|4 Nephi|Jarom|Enos|Omni|Obadiah|2 John|3 John|Philemon|Jude|First Vision|Joseph Smith—.+)\s+([2-9]|(\d\d+))/i, "$1 1:$2");
    //Default to 1st book
    ref = ref.replace(/(^|;\s*)(Nephi|cor|kings|chron|thes|pet|tim)/i, "$1 1 $2");
    //Remove double spaces
    ref = ref.replace(/\s+/i, " ");
    //Allow for cross-chapter references that start with a whole
    ref = ref.replace(/([a-z]\s*\d+)(-\d+:\d+)/i, "$1:1$2");

    ref = ref.replace(/--/, "\u2014");

    //Treat commas as semicolons in the absence of verses
    if (!ref.match(/:/)) ref = ref.replace(/,/, ";");


    //Process Dhammapadda 
    let m = ref.match(/Dhammapada ([0-9]+)/)
    if (m) {
        let dch = parseInt(m[1]);
        if (parseInt(m[1]) > 26) {
            //TODO : ref = self::getRefFromBookVerse(162,$m[1]);
        }
    }


    let cleanReference = ref.trim();;
    return cleanReference;
}

const splitReferences = function (compoundReference) {

    let refs = compoundReference.split(/\s*;\s*/);
    let runningBook = null;
    let completeRefs = [];
    for (let i in refs) {
        let pieces = refs[i].split(/([0-9:,-]+)$/);
        if (pieces[0].length > 0) runningBook = pieces[0].trim();
        completeRefs.push(runningBook + " " + pieces[1]);
    }
    return completeRefs;
}

const getBook = function (ref) {
    let book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
    if (scriptindex.bookExists(book)) return book;
    return false;
}

const getRanges = function (ref) {

    let ranges = [];
    let numbers = ref.replace(/.*?([0-9:,-]+)$/, '$1').trim();

    let isChaptersOnly = numbers.match(/:/) ? false : true;
    let isRange = !numbers.match(/-/) ? false : true;
    let isSplit = !numbers.match(/,/) ? false : true;


    // Genesis 1,3-5
    if (isChaptersOnly && isSplit && isRange) {
        let chapterRanges = numbers.split(/,/);
        for (let i in chapterRanges) {
            //3-5
            if (chapterRanges[i].match(/-/)) {
                let chapterStartandEnd = chapterRanges[i].split(/-/);
                let startChapter = parseInt(chapterStartandEnd[0], 0);
                let endChapter = parseInt(chapterStartandEnd[1], 0);
                let chapterRange = [];
                for (i = startChapter; i <= endChapter; i++) { ranges.push(i + ": 1-X"); }
            }
            //1
            else {
                ranges.push(chapterRanges[i] + ": 1-X");
            }
        }

    }
    // Genesis 1,3
    else if (isChaptersOnly && isSplit) {
        let chapters = numbers.split(/,/);
        ranges = chapters.map(chapter => chapter + ": 1-X");
    }
    //Genesis 1-2
    else if (isChaptersOnly && isRange) {
        let chapterStartandEnd = numbers.split(/-/);
        let startChapter = parseInt(chapterStartandEnd[0], 0);
        let endChapter = parseInt(chapterStartandEnd[1], 0);
        let chapterRange = [];
        for (i = startChapter; i <= endChapter; i++) { chapterRange.push(i); }
        ranges = chapterRange.map(chapter => chapter + ": 1-X");
    }
    //Genesis 1
    else if (isChaptersOnly) {
        ranges = [numbers + ": 1-X"];
    }
    //Genesis 1:1-5,10   
    else if (isRange && isSplit) {
        let mostRecentChapter = null;
        let split = numbers.split(/,/);
        let verses = null;
        for (let i in split) {

            // 2:2   OR   1:1-4
            if (split[i].match(/:/)) {
                let pieces = split[i].split(/:/);
                chapter = mostRecentChapter = pieces[0];
                verses = pieces[1];
            }
            //3   or 6-7
            else {
                chapter = mostRecentChapter;
                verses = split[i];
            }
            ranges.push(chapter + ": " + verses.trim());
        }
    }
    // Genesis 1:3,5
    else if (isSplit) {
        let split = numbers.split(/,/);
        let mostRecentChapter = null;
        let verses = null;
        for (let i in split) {
            //Genesis 1:1-5
            if (split[i].match(/:/)) {
                let pieces = numbers.split(/:/);
                chapter = mostRecentChapter = pieces[0];
                verses = pieces[1];
            }
            //10
            else {
                chapter = mostRecentChapter;
                verses = split[i];
            }
            ranges.push(chapter + ": " + verses.trim());
        }
    }
    //Genesis 1:1-10    OR    Exodus 1-2:15  OR Leviticus 1:10-2:5
    else if (isRange) {
        let chapters = numbers.match(/((\d+)[:]|^\d+)/g);
        let verses = numbers.match(/[:-](\d+)/g);

        if (chapters.length == 1) chapters.push(chapters[0]);
        chapters = chapters.map(c => parseInt(c.replace(/\D/g, '').trim()));
        verses = verses.map(v => parseInt(v.replace(/\D/g, '').trim()));

        for (let i = chapters[0]; i <= chapters[1]; i++) {
            let start = 1;
            let end = "X";
            if (chapters[0] == i) start = verses[0];
            if (chapters[1] == i) end = verses[verses.length - 1];

            ranges.push(i + ": " + start + "-" + end);
        }

    }
    else {
        ranges = [numbers];
    }




    return ranges;

}

let refIndex = null
let verseIdIndex = null

const loadVerseIds = function (book, ranges) {

    if (refIndex == null) refIndex = scriptindex.loadRefIndex();
    let verseList = [];
    for (let i in ranges) //Assumption: 1 range is within a single chapter
    {
        let range = ranges[i];
        let matches = range.match(/(\d+): *([\dX]+)-*([\dX]*)/);
        let chapter = parseInt(matches[1]);
        let start = parseInt(matches[2]);
        let end = matches[3];
        if (end == '') end = start;
        if (end == "X") end = scriptindex.loadMaxVerse(book, chapter);
        else end = parseInt(end);
        for (let verse_num = start; verse_num <= end; verse_num++) {
            if(refIndex[book]==undefined ) continue;
            if(refIndex[book][chapter]==undefined ) continue;
            if(refIndex[book][chapter][verse_num]==undefined ) continue;
            verseList.push(refIndex[book][chapter][verse_num]);
        }
    }
    return verseList;


}
const loadVerseStructure = function (verse_ids) {

    if (verseIdIndex == null) verseIdIndex = scriptindex.loadVerseIdIndex();
    let segments = consecutiveSplitter(verse_ids);
    let structure = [];
    for (let i in segments) {
        let min = segments[i][0];
        let max = segments[i][segments[i].length-1];
        structure.push([verseIdIndex[min],verseIdIndex[max]]);
    }
    return structure;
}


const consecutiveSplitter = function (verse_ids) {

    let segments = [];
    let segment = [];
    let previousVerseId = 0;
    for (let i in verse_ids) {
        if (verse_ids[i] != previousVerseId + 1 && previousVerseId!=0) {
            segments.push(segment);
            segment = [];
        }
        segment.push(verse_ids[i]);
        previousVerseId = verse_ids[i];
    }
    segments.push(segment);
    return segments;

}

const loadRefsFromRanges = function (ranges)
{

    let refs = [];
    for (let i in ranges) {
        let ref = '';
        let start_bk = ranges[i][0][0];
        let end_bk = ranges[i][1][0];
        let start_ch = ranges[i][0][1];
        let end_ch = ranges[i][1][1];
        let start_vs = ranges[i][0][2];
        let end_vs = ranges[i][1][2];
    
        if (start_bk == end_bk) {
            if (start_ch == end_ch) {
                if (start_vs == end_vs) {
                    ref = start_bk + " " + start_ch + ":" + start_vs;
                } else {

                    if(start_vs==1 && end_vs == scriptindex.loadMaxVerse(start_bk,start_ch)) //whole chapter
                    {
                        ref = start_bk + " " + start_ch;
                    }
                    else{

                        ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_vs;
                    }
                }
            } else {
                
                if(start_vs==1)
                {
                    ref = start_bk + " " + start_ch + "-" + end_ch + ":" + end_vs;
                    
                }else{

                    ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_ch + ":" + end_vs;
                }
            }
        } else {
            ref = start_bk + " " + start_ch + ":" + start_vs + " - " + start_bk + " " + end_ch + "-:" + end_vs;
        }
        refs.push(ref);
    }
    return refs;
}

module.exports = {
    getBook,
    getRanges,
    loadVerseIds,
    loadVerseStructure,
    cleanReference,
    splitReferences,
    loadRefsFromRanges

}