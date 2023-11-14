const { ko } = require("./data/scriptlang.js");
const {lookup, generateReference, setLanguage, detectReferences}= require("./scriptures.js");


const lines = [
    "Please refer to Genesis 20 in the bible",
    "Please refer to 3 Nephi 5:1-3 in the Book of Mormon",
    "For example, in Matthew 27:51, the earth quakes and ro",
    "It aligns with other scriptures (3 Nephi 12:2, Mosiah 18:13, Moses 6:52).",
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
    " 관련하여 힐라맨서 5장 24절에서는 불기둥이 불을 일으키지 않고",
    "이제 모세서 3장 참조하십시오.",
    "이제 니파이후서 12:5; 예레미야서 2:5; 앨마서 5:37 참조하십시오.",
]
ko_lines.forEach(l=>{
    let callback = (string)=>{
        return `[${string}]`
    }
    const result = detectReferences(l,callback);
    console.log({result});
});