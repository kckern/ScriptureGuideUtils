const path = require('path');
let raw_index = require(path.dirname(__filename) + '/data/scriptdata.js');
let raw_regex = require(path.dirname(__filename) + '/data/scriptregex.js');



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
    verse_ids = [];
    for (let i in refs) {
        verse_ids = verse_ids.concat(lookupSingleRef(refs[i]));
    }
    return {
        "query": query,
        "ref": ref,
        "verse_ids": verse_ids
    };
}

const lookupSingleRef = function(ref) {

    if (ref.match(/[—-](\d\s)*[A-Za-z]/ig)) return lookupMultiBookRange(ref);
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
    ref = refs.join("; ");
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
            console.log(range);
        } else {
            let maxverse = loadMaxVerse(cleanReference(matches[1]), matches[2]);
            range[1] = range[1] + ":" + maxverse;
        }
    }
    let start = lookupSingleRef(range[0])[0];
    let end = lookupSingleRef(range[1])[0];
    let = all_verse_ids = [];
    for (let i = start; i <= end; i++) all_verse_ids.push(i);
    return all_verse_ids;
}


const cleanReference = function(messyReference) {
    let ref = messyReference.trim();

    //Build Regex rules
    let regex = raw_regex.pre_rules;
    for (let i in regex) {
        var re = new RegExp(regex[i][0], "ig");
        ref = ref.replace(re, regex[i][1]);
    }
    regex = raw_regex.books;
    //process book Fixes
    for (let i in regex) {
        var re = new RegExp("\\b" + regex[i][0] + "\\.*\\b", "ig");
        ref = ref.replace(re, regex[i][1]);
    }

    regex = raw_regex.post_rules;
    for (let i in regex) {
        var re = new RegExp(regex[i][0], "ig");
        ref = ref.replace(re, regex[i][1]);
    }

    //Treat commas as semicolons in the absence of verses
    if (!ref.match(/:/)) ref = ref.replace(/,/, ";");

    let cleanReference = ref.trim();

    return cleanReference;
}
const splitReferences = function(compoundReference) {
    let refs = compoundReference.split(/\s*;\s*/);
    let runningBook = null;
    let completeRefs = [];
    for (let i in refs) {
        let pieces = refs[i].split(/([0-9:,-]+)$/);
        if (pieces[0].length > 0) runningBook = pieces[0].trim();
        if (pieces[1] == undefined) pieces[1] = '';
        completeRefs.push((runningBook + " " + pieces[1]).trim());
    }
    return completeRefs;
}
const getBook = function(ref) {
    let book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
    if (bookExists(book)) return book;
    return false;
}
const getRanges = function(ref) {
    let ranges = [];
    let numbers = ref.replace(/.*?([0-9: ,-]+)$/, '$1').trim();
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
                for (i = startChapter; i <= endChapter; i++) {
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
    //Genesis 1-2
    else if (isChaptersOnly && isRange) {
        let chapterStartandEnd = numbers.split(/-/);
        let startChapter = parseInt(chapterStartandEnd[0], 0);
        let endChapter = parseInt(chapterStartandEnd[1], 0);
        let chapterRange = [];
        for (i = startChapter; i <= endChapter; i++) {
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
    } else {
        ranges = [numbers];
    }
    return ranges;
}
let refIndex = null
let verseIdIndex = null
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
                if (start_vs == 1) {
                    ref = start_bk + " " + start_ch + "-" + end_ch + ":" + end_vs;
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
    let = verseIdIndex = [null];
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

//Aliases



module.exports = {
    lookupReference,
    generateReference,
    //Aliases
    lookup: lookupReference,
    generate: generateReference,
    ref: generateReference,
    gen: generateReference,
    parse: lookupReference,
    read: lookupReference,
    verseId2Ref: generateReference,
    ref2VerseId: lookupReference,
}