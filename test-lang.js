import { lookup, generateReference, setLanguage, detectReferences } from "./scriptures.js";



setLanguage("tr");
//korean tests

/*
utils No verses found {"reference":"2 Kings 17:18-20, 2 Chronicles 36:15-21, Jeremiah 39:1-10","lang":"ko","verse_ids":[]}
Nov 15 06:08:09 bookofmormon.online /usr/local/bin/node  info: utils No verses found {"reference":"4 Nephi 1:6-9","lang":"ko","verse_ids":[]}
Nov 15 06:08:10 bookofmormon.online /usr/local/bin/node  info: utils No verses found {"reference":"3 Ne. 8:8","lang":"ko","verse_ids":[]}
Nov 15 06:08:11 bookofmormon.online /usr/local/bin/node  info: utils No verses found {"reference":"3 Ne. 9:4","lang":"ko","verse_ids":[]}

*/

const lookUpTests = [
    "Ether 13:18",
    "1 Nephi 5:2",
    "4 Nephi 1",
    "3 Nephi 2:8",
    "3 Nephi 23:7",
    "Joseph Smith—History 1:30",
    "Helaman 6:40",
    "2 Krallar 17:18-20, 2 Tarihler 36:15-21, Yeremya 39:1-10",
    "4 Nefi 1:6-9",
    "3 Nefi 8:8",
    "3 Nefi 9:4",
    "Ether 1:32-35, Ether 7:26, Ether 9:23",
    "Yaratılış 1:1",
    "Çıkış 20:1-17",
    "Levililer 19:18",
    "Sayılar 6:24-26",
    "Tesniye 6:4-5",
    "Yeşu 1:9",
    "Mezmurlar 23:1-6",
    "Süleyman'ın Özdeyişleri 3:5-6",
    "İşaya 40:31",
    "Yeremya 29:11",
    "Matta 5:3-12",
    "Yuhanna 3:16",
    "Romalılar 8:28",
    "1 Korintliler 13:4-7",
    "Filipililer 4:6-7",
    "İbraniler 11:1",
    "Yakup 1:5",
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
