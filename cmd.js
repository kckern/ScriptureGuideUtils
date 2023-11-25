// node cmd "Genesis 1:1"

const {parse,setLanguage, generateReference}= require("./scriptures.js")

const input = process.argv[2]
const lang = process.argv[3] || null;
if(lang) setLanguage(lang);
console.log("Input: ", input)
const isVerseIds = /^[0-9,-]+$/.test(input);
console.log(isVerseIds ? generateReference(input) : parse(input))
