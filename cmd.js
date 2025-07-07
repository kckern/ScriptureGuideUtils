// node cmd "Genesis 1:1" [language]

import { parse, generateReference } from "./scriptures.js";

const input = process.argv[2]
const lang = process.argv[3] || null;
console.log("Input: ", input)
console.log("Language: ", lang || "en (default)")
const isVerseIds = /^[0-9,-]+$/.test(input);
console.log(isVerseIds ? generateReference(input, lang) : parse(input, lang))
