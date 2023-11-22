// node cmd "Genesis 1:1"

const {parse,setLanguage}= require("./scriptures.js")

const input = process.argv[2]
const lang = process.argv[3] || null;
if(lang) setLanguage(lang);
console.log("Input: ", input)
console.log(parse(input))
