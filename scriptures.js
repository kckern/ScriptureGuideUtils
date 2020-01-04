const scriptutil = require("./scriptutil.js")

const lookupReference = function (query) {
    //Cleanup
    ref = scriptutil.cleanReference(query);
    //Break compound reference into array of single references
    let refs = scriptutil.splitReferences(ref);

    //Lookup each single reference individually, return the set
    verse_ids = [];
    for (let i in refs) {
        verse_ids = verse_ids.concat(lookupSingleRef(refs[i]));
    }
    return { "query": query, "ref": ref, "verse_ids": verse_ids };
}

const lookupSingleRef = function (ref) {

    if (ref.match(/[—-](\d\s)*[A-Za-z]/ig)) return lookupMultiBookRange(ref);
    let book = scriptutil.getBook(ref);
    if (!book) return [];
    let ranges = scriptutil.getRanges(ref, book);
    let verse_ids = scriptutil.loadVerseIds(book, ranges);
    return verse_ids;

}

const generateReference = function (verse_ids) {

    let ranges = scriptutil.loadVerseStructure(verse_ids);
    let refs = scriptutil.loadRefsFromRanges(ranges);
    ref = refs.join("; ");
    return ref;

}


const lookupMultiBookRange = function (cleanRef) { //eg Matthew 15—Mark 2
    
    let range = cleanRef.split(/[—-]/);
    if(!range[0].match(/[:]/)) range[0] = range[0]+":"+1;
    if(!range[1].match(/[:]/))
    {
        let matches = range[1].match(/(.*?)\s(\d+)$/)
        let maxverse = scriptutil.loadMaxVerse(scriptutil.cleanReference(matches[1]),matches[2]);
        range[1] = range[1]+":"+maxverse;
    }
    let start = lookupSingleRef(range[0])[0];
    let end = lookupSingleRef(range[1])[0];
    let = all_verse_ids = [];
    for(let i=start; i<=end; i++) all_verse_ids.push(i);
    return all_verse_ids;
}


module.exports = { lookupReference, generateReference }