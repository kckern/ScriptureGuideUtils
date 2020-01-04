
const fs = require('fs');
let rawdata = fs.readFileSync('./data/scriptdata.json');
let raw_index = JSON.parse(rawdata);



const loadRefIndex = function () {
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


const loadVerseIdIndex = function () {
    let = verseIdIndex = [null];
    let book_list = Object.keys(raw_index);
    for (let a in book_list) {
        let book_title = book_list[a];
        for (let b in raw_index[book_title]) {
            let chapter_num = parseInt(b) + 1;
            let verse_max = raw_index[book_title][b];
            for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
                verseIdIndex.push([book_title,chapter_num,verse_num]);
            }
        }
    }
    return verseIdIndex;
}


const bookExists = function (book) {
    if (raw_index[book] === undefined) return false;
    return true;
}


const loadMaxVerse = function (book, chapter) {

    if(!bookExists(book)) return 0;
    return raw_index[book][parseInt(chapter) - 1]
}


module.exports = {
    loadRefIndex,
    bookExists,
    loadMaxVerse,
    loadVerseIdIndex
}