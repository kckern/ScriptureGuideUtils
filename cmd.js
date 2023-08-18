// node cmd "Genesis 1:1"

const {parse}= require("./scriptures.js")

const input = process.argv.slice(2).join(" ");
console.log("Input: ", input)
console.log(parse(input))
