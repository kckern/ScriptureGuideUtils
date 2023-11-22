const testdata = require("./data/testdata");
const { lookupReference, setLanguage } = require("./scriptures");
const fs = require("fs");

fs.mkdirSync("./test_results", {recursive:true});
const timestamp = new Date().toISOString();
const filename = `./test_results/test_results.html`;
fs.writeFileSync(filename, `<html><body><table>`);


const langs = Object.keys(testdata);

const ref2idTest = ([input,expected,notes]) => {
    const {ref,verse_ids} = lookupReference(input);
    const {firstVerse,lastVerse,verseCount,cleanRef} = expected;
    const {actualFirstVerse,actualLastVerse,actualVerseCount} = {actualFirstVerse:verse_ids[0],actualLastVerse:verse_ids[verse_ids.length-1],actualVerseCount:verse_ids.length};
    let result = "";

    if(firstVerse)  result += actualFirstVerse===firstVerse ? "✅" : "❌";
    if(lastVerse)   result += actualLastVerse===lastVerse ? "✅" : "❌";
    if(verseCount)  result += actualVerseCount===verseCount ? "✅" : "❌";
    if(cleanRef)    result += ref===cleanRef ? "✅" : "❌";
    process.stdout.write(result+"•");
    fs.appendFileSync(filename, `<tr>
        <td>${input}</td>
        <td>${result}</td>
        <td>${notes}</td>
        <td>${ref}</td>
        <td>${JSON.stringify({firstVerse:actualFirstVerse,lastVerse:actualLastVerse,verseCount:actualVerseCount}).replace(/"/g,"")}</td>
    </tr>`);
}



for (let lang of langs)
{
    if(lang!=="en") setLanguage(lang);
    const langdata = testdata[lang];
    const {ref2id, id2ref, detectRef} = langdata;
    if(ref2id)
    {
        console.log(`\n\n[${lang}] Testing ref2id:`);
        ref2id.forEach(ref2idTest)
    }
   ;
}

fs.appendFileSync(filename, `</table></body></html>`);
