
const { setLanguage, detectReferences, lookupReference}= require("./scriptures.js");
const fs = require("fs");
const paramLang = process.argv[2];
const langs = fs.readdirSync(`${__dirname}/test/data`)
                .filter(i=>/txt$/.test(i))
                .map(i=>i.replace(".txt",""))
                .filter(i=>{
                    if(!paramLang) return true;
                    if(paramLang && i===paramLang) return true
                    return false;
                });

let callback = (string)=>{
    const verse_ids = lookupReference(string).verse_ids;
    console.log({verse_ids})
    return `[${string}]`
}


for(const lang of langs){
    if(lang!=="en") setLanguage(lang);
    let lines = fs.readFileSync(`${__dirname}/test/data/${lang}.txt`,"utf-8").split("\n").map(i=>i.trim()).filter(x=>!!x);
    const hasAsterix = lines.some(i=>/^[*]/.test(i));
    if(hasAsterix) lines = lines.filter(i=>/^[*]/.test(i)).map(i=>i.replace(/^[*]/,""))
    for(const line of lines){
        const i = detectReferences(line,callback);
        console.log([i]);
    }
}






