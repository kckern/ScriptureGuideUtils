import raw_index_orig from './data/scriptdata.js';
import raw_regex_orig from './data/scriptregex.js';
import raw_lang from './data/scriptlang.js';
import { processReferenceDetection } from './data/scriptdetect.js';

// Browser localStorage key for language preference
const LANGUAGE_STORAGE_KEY = 'scriptureGuideUtils_language';

// Helper function to safely access localStorage
const getStoredLanguage = () => {
    try {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(LANGUAGE_STORAGE_KEY);
        }
    } catch (e) {
        // localStorage might not be available in some environments
    }
    return null;
};

const setStoredLanguage = (language) => {
    try {
        if (typeof localStorage !== 'undefined') {
            if (language) {
                localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
            } else {
                localStorage.removeItem(LANGUAGE_STORAGE_KEY);
            }
        }
    } catch (e) {
        // localStorage might not be available in some environments
    }
};

// Global default language (can be overridden by localStorage)
let defaultLanguage = null;

const setLanguage = function(language) {
    defaultLanguage = language;
    setStoredLanguage(language);
};

const getEffectiveLanguage = function(explicitLanguage) {
    // Priority: explicit parameter > stored language > default language > 'en'
    return explicitLanguage || getStoredLanguage() || defaultLanguage || 'en';
};

const lookupReference = function(query, language = null) {
    const isValidReference = query && typeof query === 'string' && query.length > 0;
    if (!isValidReference) return {
        "query": query,
        "ref": "",
        "verse_ids": []
    };

    // Get effective language (explicit > stored > default > 'en')
    const effectiveLanguage = getEffectiveLanguage(language);
    const config = getLanguageConfig(effectiveLanguage);
    
    //Cleanup
    let ref = cleanReference(query, config);
    //Break compound reference into array of single references
    let refs = splitReferences(ref, config);

    //Lookup each single reference individually, return the set
    let verse_ids = [];
    for (let i in refs) {
        verse_ids = verse_ids.concat(lookupSingleRef(refs[i], config));
    }

    // Fallback to English if no results found and language was specified
    if(!verse_ids?.length && effectiveLanguage && effectiveLanguage !== 'en') {
        const results = lookupReference(query, 'en');
        return results;
    }

    return {
        "query": query,
        "ref": ref,
        "verse_ids": verse_ids
    };
}

const lookupSingleRef = function(ref, config) {
    const booksWithDashRegex = /^(joseph|조셉)/i; // TODO: get from config
    //todo: better handling of multi-book ranges for unicode
    if (!booksWithDashRegex.test(ref) && ref.match(/[—-](\d\s)*[\D]/ig)) return lookupMultiBookRange(ref, config);
    let book = getBook(ref, config);
    if (!book) return [];
    let ranges = getRanges(ref, book);
    let verse_ids = loadVerseIds(book, ranges, config);
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

const generateReference = function(verse_ids, language = null) {

    verse_ids = validateVerseIds(verse_ids);
    if(!verse_ids) return '';

    const effectiveLanguage = getEffectiveLanguage(language);
    const config = getLanguageConfig(effectiveLanguage);
    let ranges = loadVerseStructure(verse_ids, config);
    let refs = loadRefsFromRanges(ranges, config);

    let ref = refs.join("; ");
    return ref;

}


const lookupMultiBookRange = function(cleanRef, config) { //eg Matthew 15—Mark 2

    let range = cleanRef.split(/[—-]/);
    if (!range[0].match(/[:]/)) {
        if (range[0].match(/\d+\s*$/)) range[0] = range[0].trim() + ":" + 1;
        else range[0] = range[0].trim() + " 1:1";
    }
    if (!range[1].match(/[:]/)) {

        let matches = range[1].match(/(.*?)\s(\d+)$/);
        if (matches === null) {
            //find end of book
            let maxChapter = loadMaxChapter(range[1], config);
            let maxverse = loadMaxVerse(range[1], maxChapter, config);
            range[1] = range[1] + " " + maxChapter + ":" + maxverse;
           // console.log(range);
        } else {
            let maxverse = loadMaxVerse(cleanReference(matches[1], config), matches[2], config);
            range[1] = range[1] + ":" + maxverse;
        }
    }
    let start = lookupSingleRef(range[0], config)[0];
    let end = lookupSingleRef(range[1], config)[0];
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


const cleanReference = function(messyReference, config) {

    let ref = messyReference.replace(/[\s]+/g, " ").trim();

    //Build Regex rules
    let regex = config.raw_regex.pre_rules;
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
    const [wordBreak, buffer] = config.raw_regex.spacing || ["\\b", ""];

    let srcbooks = config.raw_regex.books;
    let dstbooks = buffer ? config.raw_regex.books.map(i => [i[1], i[1]]) : [];
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

    cleanReference = handleSingleChapterBookRefs(cleanReference, config);
    if (!cleanReference.match(/:/)) cleanReference = cleanReference.replace(/,/, "; ");
    return cleanReference;
}

const handleSingleChapterBookRefs = function(ref, config) {

   const singleChapterBooks = Object.keys(config.raw_index).filter(book => loadMaxChapter(book, config) == 1);
   const [matchingBook] = singleChapterBooks.filter(book => ref.match(new RegExp(`^${book} \\d+`)));
   if(new RegExp(`^${matchingBook} 1:`).test(ref)) return ref;
   if(new RegExp(`^${matchingBook} 1$`).test(ref)) return ref;
   ref = ref.replace(new RegExp(`^${matchingBook} (\\d+)`), `${matchingBook} 1:$1`);
   return ref;
}

const splitReferences = function(compoundReference, config) {
    let refs = compoundReference.split(/\s*;\s*/);
    let runningBook = "";
    let completeRefs = [];
    for (let i in refs) {
        const ref = refs[i];
        let pieces = ref.split(/([0-9:,-]+)$/);
        const firstPiece = pieces[0].trim();
        runningBook = bookExists(firstPiece, config) ? firstPiece : runningBook;
        const needsPreBook = !bookExists(firstPiece, config);
        const preBook = needsPreBook && runningBook ? runningBook : "";
        completeRefs.push((preBook + " " + ref).trim());
    }
    return completeRefs;
}
const getBook = function(ref, config) {
    let book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
    book = book.replace(/-/g, "—");
    if (bookExists(book, config)) return book;
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
const loadVerseIds = function(book, ranges, config) {
    let refIndex = loadRefIndex(config);
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
        if (end == "X") end = loadMaxVerse(book, chapter, config);
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
const loadVerseStructure = function(verse_ids, config) {
    let verseIdIndex = loadVerseIdIndex(config);
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
const loadRefsFromRanges = function(ranges, config) {
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
                    if (start_vs == 1 && end_vs == loadMaxVerse(start_bk, start_ch, config)) //whole chapter
                    {
                        ref = start_bk + " " + start_ch;
                    } else {
                        ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_vs;
                    }
                }
            } else {
                if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch, config)) {
                    ref = start_bk + " " + start_ch + "-" + end_ch;
                } else {
                    ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_ch + ":" + end_vs;
                }
            }
        } else {
            if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch, config)) {
                ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch;
            } else if (end_vs == loadMaxVerse(end_bk, end_ch, config)) {
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
        
        // Apply language-specific post rules
        if (config.raw_regex.post_rules) {
            for (let rule of config.raw_regex.post_rules) {
                const re = new RegExp(rule[0], "ig");
                ref = ref.replace(re, rule[1]);
            }
        }
        
        refs.push(ref);
    }
    return refs;
}

const loadRefIndex = function(config) {
    let refIndex = {};
    let verse_id = 1;
    let book_list = Object.keys(config.raw_index);
    for (let a in book_list) {
        let book_title = book_list[a];
        refIndex[book_title] = {};
        for (let b in config.raw_index[book_title]) {
            let chapter_num = parseInt(b) + 1;
            let verse_max = config.raw_index[book_title][b];
            refIndex[book_title][chapter_num] = {};
            for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
                refIndex[book_title][chapter_num][verse_num] = verse_id;
                verse_id++;
            }
        }
    }
    return refIndex;
}


const loadVerseIdIndex = function(config) {
    let verseIdIndex = [null];
    let book_list = Object.keys(config.raw_index);
    for (let a in book_list) {
        let book_title = book_list[a];
        for (let b in config.raw_index[book_title]) {
            let chapter_num = parseInt(b) + 1;
            let verse_max = config.raw_index[book_title][b];
            for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
                verseIdIndex.push([book_title, chapter_num, verse_num]);
            }
        }
    }
    return verseIdIndex;
}


const bookExists = function(book, config) {
    if (config.raw_index[book] === undefined) return false;
    return true;
}


const loadMaxChapter = function(book, config) {

    if (!bookExists(book, config)) return 0;
    return config.raw_index[book].length;
}

const loadMaxVerse = function(book, chapter, config) {

    if (!bookExists(book, config)) return 0;
    return config.raw_index[book][parseInt(chapter) - 1]
}



const detectReferences = (content, callBack, language = null) => {

    callBack = callBack ? callBack : (i)=>{return `[${i}]`};
    const effectiveLanguage = getEffectiveLanguage(language);
    const config = getLanguageConfig(effectiveLanguage);
    const src = config.raw_regex.books.map(i => i[0]);
    const dst = [...new Set(config.raw_regex.books.map(i => i[1]))];
    const books = [...dst, ...src];
    return processReferenceDetection(content, books, config.lang_extra, (query) => lookupReference(query, effectiveLanguage), callBack);

}

const getLanguageConfig = function(language) {
    // Default to English if no language specified or not found
    const effectiveLanguage = language && raw_lang[language] ? language : 'en';
    
    const config = {
        language: effectiveLanguage,
        raw_index: raw_index_orig,
        raw_regex: {...raw_regex_orig},
        lang_extra: {},
        wordBreak: "\\b"
    };

    // For English or if language not found, use defaults
    if (effectiveLanguage === 'en' || !raw_lang[effectiveLanguage]) {
        return config;
    }

    // Process language-specific data
    const langData = raw_lang[effectiveLanguage];
    
    if(langData.books) {
        config.raw_regex.books = [];
        let new_index = {};
        const bookList = Object.keys(langData.books);
        for(let book of bookList) {
            const book_index = bookList.indexOf(book);
            const original_bookname = Object.keys(raw_index_orig)?.[book_index];
            if (original_bookname) {
                new_index[book] = raw_index_orig[original_bookname];
            }
            const matches = [book, ...langData.books[book]];
            config.raw_regex.books = config.raw_regex.books.concat(matches.map(i => [i, book]));
        }
        config.raw_index = new_index;
    }

    config.raw_regex.pre_rules = langData.pre_rules || config.raw_regex.pre_rules;
    config.raw_regex.post_rules = langData.post_rules || config.raw_regex.post_rules;
    config.raw_regex.spacing = langData.spacing || ["\\b", ""];
    config.lang_extra = langData.matchRules || {};
    config.wordBreak = langData.wordBreak || "\\b";

    return config;
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