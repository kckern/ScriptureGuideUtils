import testdata from "./data/testdata.js";
import { lookupReference, setLanguage, generate, generateReference } from "./scriptures.js";
import fs from "fs";

fs.mkdirSync("./test_results", {recursive:true});
const timestamp = new Date().toISOString();
const filename = `./test_results/test_results.html`;
fs.writeFileSync(filename, `<html>
<head>
<style>
body {font-family: sans-serif;}
.json-data {font-family: monospace; word-break: break-all; white-space: pre-wrap; width: 20vw;}
table {border-collapse: collapse;}
td {border: 1px solid black; padding: 5px;}
</style>
<body><table>`);


const langs = Object.keys(testdata);

const ref2idTest = ([input,expected,notes]) => {
    const {ref,verse_ids} = lookupReference(input);
    const {firstVerse,lastVerse,verseCount,cleanRef} = expected || {};
    const {actualFirstVerse,actualLastVerse,actualVerseCount} = {actualFirstVerse:verse_ids[0],actualLastVerse:verse_ids[verse_ids.length-1],actualVerseCount:verse_ids.length};
    let result = "";

    if(firstVerse)  result += actualFirstVerse===firstVerse ? "✅" : "❌";
    if(lastVerse)   result += actualLastVerse===lastVerse ? "✅" : "❌";
    if(verseCount)  result += actualVerseCount===verseCount ? "✅" : "❌";
    if(cleanRef)    result += ref===cleanRef ? "✅" : "❌";
    //if(cleanRef) console.log({cleanRef,ref});

    process.stdout.write(result+"•");
    fs.appendFileSync(filename, `<tr>
        <td class="notes">${notes || ""}</td>
        <td class="result">${result}</td>
        <td class="input">${input}</td>
        <td class="ref">${ref}</td>
        <td class="json-data">${JSON.stringify({firstVerse:actualFirstVerse,lastVerse:actualLastVerse,verseCount:actualVerseCount}).replace(/"/g,"")}</td>    </tr>`);
}

const id2refTest = ([input,expected,notes]) => {
    const reference = generateReference(input);
    let result = "";
    if(expected) result += reference===expected ? "✅" : "❌";
    process.stdout.write(result+"•");
    fs.appendFileSync(filename, `<tr>
        <td class="notes">${notes || ""}</td>
        <td class="result">${result}</td>
        <td class="input">${input}</td>
        <td class="ref">${reference}</td>
        <td class="json-data"></td>    </tr>`);


}

console.log(langs);
for (let lang of langs)
{
    setLanguage(null);
    if(lang!=="en") setLanguage(lang);
    const langdata = testdata[lang];
    const {ref2id, id2ref, detectRef} = langdata;
    if(ref2id)
    {
        console.log(`\n\n[${lang}] Testing ref2id:`);
        ref2id.forEach(ref2idTest)
    }
    if(id2ref)
    {
        console.log(`\n\n[${lang}] Testing id2ref:`);
        id2ref.forEach(id2refTest)
    }
}

fs.appendFileSync(filename, `</table></body></html>`);
