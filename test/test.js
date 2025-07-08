import * as scriptures from "../src/scriptures.mjs";

let output,ref;

console.log("\n===================\n\n");
let testcases = 
[
    ["Simple reference",    "Exodus 1:1"],
    ["Simple chapter",      "Genesis 2"],
    ["Split chapters",      "Genesis 1,3"],
    ["Chapter range",       "Exodus 3-5"],
    ["Chapter range and split",       "Exodus 3-5,8"],
    ["Verse range",       "Exodus 20:1-10"],
    ["Verse range and split",       "Exodus 20:1-5,10"],
    ["Verse Split",       "Exodus 20:5,10"],
    ["Verse range spanning multiple chapters",       "Exodus 1:5-4:3"],
    ["Chapter range ending in partial chapter",       "Exodus 3-4:10"],
    ["Chapter range spanning multiple books",       "Genesis 30 - Exodus 2"],
    ["Chapter range spanning multiple books, ending in partial chapter",       "Genesis 30 - Exodus 2:5"],
    ["Chapter range spanning multiple books, starting in partial chapter",       "Genesis 30:10 - Exodus 2"],
    ["Chapter range spanning multiple books, starting and ending with partial chapters",       "Genesis 30:10 - Exodus 2:5"],
    ["Compound reference in same book","Exodus 5:1;6:2;8:5"],
    ["Compound reference in different books","Exodus 5:1; Leviticus 6:2; Numbers 8:5"],
    ["Compound reference ranges in different books","Exodus 5:1-3; Leviticus 6:2-5; Numbers 8:5-6"],
    ["Entire Book Range","Genesis - Numbers"],
    ["Abbreviation detection","Mt2.5;Mk3;Lk4;Jn5.2-6;1Jn1.5,7-8;3Jn1.1"],
    ["Other Books","1 Nephi 19:11"]

]


for (let i in testcases)
{
    console.log("\n===================\n\nTEST CASE #"+(parseInt(i)+1)+": "+testcases[i][0]);
    console.log("Input: ");
    console.log([testcases[i][1]]);
    output = scriptures.lookupReference(testcases[i][1]);
    console.log("Output: ");
    console.log(output);
    ref = scriptures.generateReference(output.verse_ids);
    console.log("Reference generated from verse ids: ");
    console.log([ref]);
}
