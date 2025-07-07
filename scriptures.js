import raw_index_orig from './data/scriptdata.js';
import raw_regex_orig from './data/scriptregex.js';
import raw_lang from './data/scriptlang.js';
import { processReferenceDetection } from './data/scriptdetect.js';

let lang = null;
let wordBreak = "\\b";
let lang_extra = {};
let raw_index = raw_index_orig;
let raw_regex = raw_regex_orig;
let refIndex = null
let verseIdIndex = null
const orginal_raw_index = {...raw_index_orig};
const orginal_raw_regex = {...raw_regex_orig};


const setLanguage = function(language) {

    if(lang===language) return;// console.log(`Language already set to ${lang}`);
    lang = language;
    refIndex = null
    verseIdIndex = null
    if(!lang || !raw_lang?.[lang]) {
        //revert to originals
        raw_index = {...orginal_raw_index};
        raw_regex = {...orginal_raw_regex};
        lang_extra = {};
        wordBreak = "\\b"; //TODO get from lang config?
        return ;
    }

    if(raw_lang[lang]?.books)
    {
        raw_regex.books = [];
        let new_index = {};
        const bookList = Object.keys(raw_lang[lang].books);
        for(let book of bookList) {
            const book_index = bookList.indexOf(book);
            const original_bookname = Object.keys(orginal_raw_index)?.[book_index];
            new_index[book] = raw_index[original_bookname];
            const matches = [book,...raw_lang[lang].books[book]]; //TODO, do I need the book in the list?
            raw_regex.books = raw_regex.books.concat(matches.map(i => [i,book]));
        }
        raw_index = new_index;
    }
    raw_regex.pre_rules = raw_lang[lang]?.pre_rules || raw_regex.pre_rules;     //TODO: add replace/append options
    raw_regex.post_rules = raw_lang[lang]?.post_rules || raw_regex.post_rules;  //TODO: add replace/append options
    raw_regex.spacing = raw_lang[lang]?.spacing || ["", ""]; //TODO: Set spacing

    //TODO: Set booksWithDashRegex

    if(raw_lang[lang]?.matchRules) lang_extra = raw_lang[lang]?.matchRules;

}


const lookupReference = function(query) {


    const isValidReference = query && typeof query === 'string' && query.length > 0;
    if (!isValidReference) return {
        "query": query,
        "ref": "",
        "verse_ids": []
    };

    //Cleanup
    let ref = cleanReference(query);
    //Break compound reference into array of single references
    let refs = splitReferences(ref);


    //Lookup each single reference individually, return the set
    let verse_ids = [];
    for (let i in refs) {
        verse_ids = verse_ids.concat(lookupSingleRef(refs[i]));
    }

    if(!verse_ids?.length && lang)
    {
        const original_lang = lang+""; //clone
        //try again with no language
        setLanguage(null);
        const results = lookupReference(query);
        setLanguage(original_lang);
        return results;
    }

    return {
        "query": query,
        "ref": ref,
       // "gen": generateReference(verse_ids),
        "verse_ids": verse_ids
    };
}

const lookupSingleRef = function(ref) {
    const booksWithDashRegex = /^(joseph|조셉)/i; // TODO: get from lang config
    //todo: better handling of multi-book ranges for unicode
    if (!booksWithDashRegex.test(ref) && ref.match(/[—-](\d\s)*[\D]/ig)) return lookupMultiBookRange(ref);
    let book = getBook(ref);
    if (!book) return [];
    let ranges = getRanges(ref, book);
    let verse_ids = loadVerseIds(book, ranges);
    return verse_ids;

}

const validateVerseIds = function(verse_ids) {

    if(!verse_ids) return false;
    if(typeof verse_ids === 'string') verse_ids = verse_ids.split(/[,;]/);
    if(!Array.isArray(verse_ids)) verse_ids = [verse_ids];
    verse_ids = verse_ids.map(v => parseInt(v));
    verse_ids = verse_ids.filter(v => !isNaN(v));
    if(verse_ids.length == 0) return false;
    //if array of non zero integers
    if(verse_ids.filter(v => v > 0).length == verse_ids.length) return verse_ids;
    return false;

}

const generateReference = function(verse_ids) {

    verse_ids = validateVerseIds(verse_ids);
    if(!verse_ids) return '';

    let ranges = loadVerseStructure(verse_ids);
    let refs = loadRefsFromRanges(ranges);

    let ref = refs.join("; ");
    return ref;

}


const lookupMultiBookRange = function(cleanRef) { //eg Matthew 15—Mark 2


    let range = cleanRef.split(/[—-]/);
    if (!range[0].match(/[:]/)) {
        if (range[0].match(/\d+\s*$/)) range[0] = range[0].trim() + ":" + 1;
        else range[0] = range[0].trim() + " 1:1";
    }
    if (!range[1].match(/[:]/)) {

        let matches = range[1].match(/(.*?)\s(\d+)$/);
        if (matches === null) {
            //find end of book
            let maxChapter = loadMaxChapter(range[1]);
            let maxverse = loadMaxVerse(range[1], maxChapter);
            range[1] = range[1] + " " + maxChapter + ":" + maxverse;
           // console.log(range);
        } else {
            let maxverse = loadMaxVerse(cleanReference(matches[1]), matches[2]);
            range[1] = range[1] + ":" + maxverse;
        }
    }
    let start = lookupSingleRef(range[0])[0];
    let end = lookupSingleRef(range[1])[0];
    let all_verse_ids = [];
    for (let i = start; i <= end; i++) all_verse_ids.push(i);
    return all_verse_ids;
}

const strToHash = function(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = hash * 31 + str.charCodeAt(i);
        //max 32
        if (hash > 2147483647) hash = hash % 2147483647;
    }
    return `==${hash}==`;
}


const cleanReference = function(messyReference) {

    let ref = messyReference.replace(/[\s]+/g, " ").trim();

    //Build Regex rules
    let regex = raw_regex.pre_rules;
    for (let i in regex) {
        var re = new RegExp(regex[i][0], "ig");
        ref = ref.replace(re, regex[i][1]);
    }

    //Turn dots into colons
    ref = ref.replace(/(\d+)[.](\d+)/g, "$1:$2");
    ref = ref.replace(/[.]/g, "");

    //Treat commas as semicolons in the absence of verses
    //add spaces after semicolons
    ref = ref.replace(/;/g, "; ");
    //add space before numbers
    ref = ref.replace(/^([0-9;,:-]+)(\d+)/g, "$1 $2");
    //spaces around book ranges !!! Breaks vietnamese, which uses dashes (optionally) instead of spaces in book names
    ref = ref.replace(/([–-])(\D+)/g, " $1 $2 ");

    //Handle non-latin languages because \b only works for latin alphabet
    const [wordBreak, buffer] = raw_regex.spacing || ["\\b", ""];



    let srcbooks = raw_regex.books;
    let dstbooks = buffer ? raw_regex.books.map(i => [i[1], i[1]]) : [];
    let bookMatchList = [...dstbooks, ...srcbooks].sort((a, b) => b[0].length - a[0].length);
    regex = bookMatchList;
    let hashCypher = {};
    for (let i in regex) {
        const [,book] = regex[i];
        const hash = strToHash(book);
        hashCypher[book] = hash;
    }
    for (let i in regex) {
        var re = new RegExp( wordBreak + buffer + regex[i][0] + buffer + "\\.*"+wordBreak, "ig");
        let replacement = hashCypher[regex[i][1]] || regex[i][1];
        ref = (buffer+ref+buffer).replace(re, replacement).trim();
    }
    const books = Object.keys(hashCypher);
    const hashes = Object.values(hashCypher);
    ref = ref.replace(new RegExp(hashes.join("|"), "g"), function (match) {
       const bookValue = books[hashes.indexOf((match))];
         return bookValue + " ";
    }
    );


    //Cleanup
    ref = ref.replace(/\s+/g, " "); //remove double spaces
    ref = ref.replace(/\s*[~–-]\s*/g, "-"); //remove spaces around dashes
    ref = ref.replace(/;(\S+)/g, "; $1"); //add space after semicolons

    let cleanReference = ref.trim();

    cleanReference = handleSingleChapterBookRefs(cleanReference);
    if (!cleanReference.match(/:/)) cleanReference = cleanReference.replace(/,/, "; ");
    return cleanReference;
}

const handleSingleChapterBookRefs = function(ref) {

   const singleChapterBooks = Object.keys(raw_index).filter(book => loadMaxChapter(book) == 1);
   const [matchingBook] = singleChapterBooks.filter(book => ref.match(new RegExp(`^${book} \\d+`)));
   if(new RegExp(`^${matchingBook} 1:`).test(ref)) return ref;
   if(new RegExp(`^${matchingBook} 1$`).test(ref)) return ref;
   ref = ref.replace(new RegExp(`^${matchingBook} (\\d+)`), `${matchingBook} 1:$1`);
   return ref;
}

const splitReferences = function(compoundReference) {
    let refs = compoundReference.split(/\s*;\s*/);
    let runningBook = "";
    let completeRefs = [];
    for (let i in refs) {
        const ref = refs[i];
        let pieces = ref.split(/([0-9:,-]+)$/);
        const firstPiece = pieces[0].trim();
        runningBook = bookExists(firstPiece) ? firstPiece : runningBook;
        const needsPreBook = !bookExists(firstPiece);
        const preBook = needsPreBook && runningBook ? runningBook : "";
        completeRefs.push((preBook + " " + ref).trim());
    }
    return completeRefs;
}
const getBook = function(ref) {
    let book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
    book = book.replace(/-/g, "—");
    if (bookExists(book)) return book;
    return false;
}
const getRanges = function(ref) {
    let ranges = [];
    let numbers = ref.replace(/.*?([0-9: ,-]+)$/, '$1').trim();
    numbers=numbers.replace(/^(\d+)-(\d+):(\d+)$/g, '$1:1-$2:$3'); //implict first verse
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
                for (leti = startChapter; i <= endChapter; i++) {
                    ranges.push(i + ": 1-X");
                }
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
    //Genesis 1-2 (ch-ch)
    else if (isChaptersOnly && isRange) {
        let chapterStartandEnd = numbers.split(/-/);
        let startChapter = parseInt(chapterStartandEnd[0], 0);
        let endChapter = parseInt(chapterStartandEnd[1], 0);
        let chapterRange = [];
        for (let i = startChapter; i <= endChapter; i++) {
            chapterRange.push(i);
        }
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
        let chapter = null;
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
        let chapter = null;
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
    //Genesis 1:1-10 (cv-v)    OR    Exodus 1-2:15 (c-cv)  OR Leviticus 1:10-2:5 (cv-cv)
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
    } else {
        ranges = [numbers];
    };
    return ranges;
}
const loadVerseIds = function(book, ranges) {
    if (refIndex == null) refIndex = loadRefIndex();
    let verseList = [];
    for (let i in ranges) //Assumption: 1 range is within a single chapter
    {
        let range = ranges[i];
        let matches = range.match(/(\d+): *([\dX]+)-*([\dX]*)/);
        if(!matches) continue;
        let chapter = parseInt(matches[1]);
        let start = parseInt(matches[2]);
        let end = matches[3];
        if (end == '') end = start;
        if (end == "X") end = loadMaxVerse(book, chapter);
        else end = parseInt(end);
        for (let verse_num = start; verse_num <= end; verse_num++) {
            if (refIndex[book] == undefined) continue;
            if (refIndex[book][chapter] == undefined) continue;
            if (refIndex[book][chapter][verse_num] == undefined) continue;
            verseList.push(refIndex[book][chapter][verse_num]);
        }
    }
    return verseList;
}
const loadVerseStructure = function(verse_ids) {
    if (verseIdIndex == null) verseIdIndex = loadVerseIdIndex();
    let segments = consecutiveSplitter(verse_ids);
    let structure = [];
    for (let i in segments) {
        let min = segments[i][0];
        let max = segments[i][segments[i].length - 1];
        structure.push([verseIdIndex[min], verseIdIndex[max]]);
    }
    return structure;
}
const consecutiveSplitter = function(verse_ids) {
    let segments = [];
    let segment = [];
    let previousVerseId = 0;
    for (let i in verse_ids) {
        if (verse_ids[i] != previousVerseId + 1 && previousVerseId != 0) {
            segments.push(segment);
            segment = [];
        }
        segment.push(verse_ids[i]);
        previousVerseId = verse_ids[i];
    }
    segments.push(segment);
    return segments;
}
const loadRefsFromRanges = function(ranges) {
    let refs = [];
    let mostRecentBook, mostRecentChapter;
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
                if (start_bk == mostRecentBook) start_bk = '';
                if (start_bk == mostRecentBook && start_ch == mostRecentChapter) start_ch = '';
                if (start_vs == end_vs) {
                    ref = start_bk + " " + start_ch + ":" + start_vs;
                } else {
                    if (start_vs == 1 && end_vs == loadMaxVerse(start_bk, start_ch)) //whole chapter
                    {
                        ref = start_bk + " " + start_ch;
                    } else {
                        ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_vs;
                    }
                }
            } else {
                if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch)) {
                    ref = start_bk + " " + start_ch + "-" + end_ch;
                } else {
                    ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_ch + ":" + end_vs;
                }
            }
        } else {
            if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch)) {
                ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch;
            } else if (end_vs == loadMaxVerse(end_bk, end_ch)) {
                ref = start_bk + " " + start_ch + ":" + start_vs + " - " + end_bk + " " + end_ch;
            } else if (start_vs == 1) {
                ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch + ":" + end_vs;
            } else {
                ref = start_bk + " " + start_ch + ":" + start_vs + " - " + end_bk + " " + end_ch + ":" + end_vs;
            }
        }
        if (start_bk != '') mostRecentBook = start_bk;
        if (start_ch != '') mostRecentChapter = start_ch;
        ref = ref.replace(/^\s+:*/, '').trim();
        refs.push(ref);
    }
    return refs;
}

const loadRefIndex = function() {
    let refIndex = {};
    let verse_id = 1;
    let book_list = Object.keys(raw_index);
    //if(raw_lang[lang]?.books) book_list = raw_lang[lang].books
    for (let a in book_list) {
        let book_title = book_list[a];
        refIndex[book_title] = {};
        for (let b in raw_index[book_title]) {
            let chapter_num = parseInt(b) + 1;
            let verse_max = raw_index[book_title][b];
            refIndex[book_title][chapter_num] = {};
            for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
                refIndex[book_title][chapter_num][verse_num] = verse_id;
                verse_id++;
            }
        }

    }
    return refIndex;
}


const loadVerseIdIndex = function() {
    let verseIdIndex = [null];
    let book_list = Object.keys(raw_index);
    for (let a in book_list) {
        let book_title = book_list[a];
        for (let b in raw_index[book_title]) {
            let chapter_num = parseInt(b) + 1;
            let verse_max = raw_index[book_title][b];
            for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
                verseIdIndex.push([book_title, chapter_num, verse_num]);
            }
        }
    }
    return verseIdIndex;
}


const bookExists = function(book) {
    if (raw_index[book] === undefined) return false;
    return true;
}


const loadMaxChapter = function(book) {

    if (!bookExists(book)) return 0;
    return raw_index[book].length;
}

const loadMaxVerse = function(book, chapter) {

    if (!bookExists(book)) return 0;
    return raw_index[book][parseInt(chapter) - 1]
}



const detectReferences = (content,callBack) => {

    callBack = callBack ? callBack : (i)=>{return `[${i}]`};
    const src = raw_regex.books.map(i => i[0]);
    const dst = [...new Set(raw_regex.books.map(i => i[1]))];
    const books = [...dst, ...src];
    return processReferenceDetection(content,books,lang_extra,lookupReference,callBack);

}




export {
    lookupReference,
    generateReference,
    setLanguage,
    detectReferences,

    //Aliases for convenience
    setLanguage as lang,
    setLanguage as language,
    setLanguage as setLang,

    lookupReference as lookup,
    lookupReference as parse,
    lookupReference as read,
    lookupReference as ref2VerseId,

    generateReference as ref,
    generateReference as gen,
    generateReference as generate,
    generateReference as verseId2Ref,

    detectReferences as detect,
    detectReferences as detectScriptureReferences,
    detectReferences as detectRefs,
    detectReferences as detectScriptures,
    detectReferences as linkRefs,
};