// node cmd "Genesis 1:1"

const {parse}= require("./scriptures.js", {encoding: "utf-8"})
const validlangs = ["ko"];
let lang = process.argv[process.argv.length-1] || "en";
lang = validlangs.includes(lang) ? lang : null;

const input = process.argv.slice(2).join(" ").replace(new RegExp(lang+"$"), "").trim()
console.log("Input: ", input)
console.log(parse(input, lang))
