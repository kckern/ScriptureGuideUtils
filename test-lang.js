const {lookup, generateReference, setLanguage, detectReferences}= require("./scriptures.js");


setLanguage("ko");
//korean tests
const lookUpTests = [
    "이더서 13장 18절",
    "니전5.2",
    "제3니파이 2장 8절",
    "제3니파이 23장 7절",
    "조셉 스미스—역사 1장 30절",
    "이더서 1장 32~35절, 이더서 7장 26절, 이더서 9장 23절",

];

lookUpTests.forEach(t=>{
    const result = lookup(t);
    console.log({result});
});
process.exit();
setLanguage();
//english tests
const lookUpTests2 = [
    "Moses 1:1",
    "3 Nephi 9:3",
    "Joseph Smith—History 1:20",

]

lookUpTests2.forEach(t=>{
    const result = lookup(t);
    console.log({result});
});

process.exit();

let testcases = [
["Simple reference",    "출애굽기 1:1"],
["Simple chapter",      "창세기 2"],
["Split chapters",      "창세기 1,3"],
["Chapter range",       "출애굽기 3-5"],
["Chapter range and split",       "출애굽기 3-5,8"],
["Verse range",       "출애굽기 20:1-10"],
["Verse range and split",       "출애굽기 20:1-5,10"],
["Verse Split",       "출애굽기 20:5,10"],
["Verse range spanning multiple chapters",       "출애굽기 1:5-4:3"],
["Chapter range ending in partial chapter",       "출애굽기 3-4:10"],
["Chapter range spanning multiple books",       "창세기 30 - 출애굽기 2"],
["Chapter range spanning multiple books, ending in partial chapter",       "창세기 30 - 출애굽기 2:5"],
["Chapter range spanning multiple books, starting in partial chapter",       "창세기 30:10 - 출애굽기 2"],
["Chapter range spanning multiple books, starting and ending with partial chapters",       "창세기 30:10 - 출애굽기 2:5"],
["Compound reference in same book","출애굽기 5:1;6:2;8:5"],
["Compound reference in different books","출애굽기 5:1; 레위기 6:2; 민수기 8:5"],
["Compound reference ranges in different books","출애굽기 5:1-3; 레위기 6:2-5; 민수기 8:5-6"],
["Entire Book Range","창세기 - 민수기"],
["Abbreviation detection","마2.5;막3;눅4;요5.2-6;1요일1.5,7-8;3요삼1.1"],
["Numbered Books","요삼1.1"],
];

testcases = [
    ["test1","니파이전서 5장 1-4"],
    ["test1","니파이전서 5:1-4"],
    ["test1","니파이전서 5장"],
    ["test1","니전5.1-2"]
];

for (let i in testcases)
{
    console.log("\n===================\n\nTEST CASE #"+(parseInt(i)+1)+": "+testcases[i][0]);
    console.log("Input: ");
    console.log([testcases[i][1]]);
    output = lookup(testcases[i][1]);
    console.log("Output: ");
    console.log(output);
    ref = generateReference(output.verse_ids);
    console.log("Reference generated from verse ids: ");
    console.log([ref]);
}
