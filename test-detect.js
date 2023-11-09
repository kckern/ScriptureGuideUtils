const { ko } = require("./data/scriptlang.js");
const {lookup, generateReference, setLanguage, detectReferences}= require("./scriptures.js");


const lines = [
    "Please refer to Genesis 20 in the bible",
    "Please refer to 3 Nephi 5:1-3 in the Book of Mormon"
]

lines.forEach(l=>{
    const result = detectReferences(l);
    console.log({result});
});

setLanguage("ko");

const ko_lines = [
    "성경의 창세기 20장을 참조하십시오.",
    "이제 제3니파이서 5:1-3을 참조하십시오.",
    "이제 제4니파이서 1:4~5절 참조하십시오.",
    "이제 제4니파이서 1장4~5절 참조하십시오.",
    "이제 제4니파이서 1장 4~5절 참조하십시오.",
    "이제 제4니파이서 1.4~5절 참조하십시오.",
    "이제 제4니파이서 4~5절 참조하십시오.",
    "이제 모세서 3장 참조하십시오."
]
ko_lines.forEach(l=>{
    let callback = (string)=>{
        const verse_ids = lookup(string).verse_ids;
        return JSON.stringify({string,verse_ids});
    }
    const result = detectReferences(l,callback);
    console.log({result});
});