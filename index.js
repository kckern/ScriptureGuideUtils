const scriptures= require("./scriptures.js")

let output,ref;
//A
output = scriptures.lookupReference("james3.5");
console.log(output);
ref = scriptures.generateReference(output.verse_ids);
console.log([ref]);

/*
//B
scriptures.lookupReference("Genesis 1,3");

//C
scriptures.lookupReference("Genesis 1-4");

//D
scriptures.lookupReference("Genesis 1");

//E
scriptures.lookupReference("Genesis 1:1-5,10");

//F
scriptures.lookupReference("Genesis 1:3,5");

//G
scriptures.lookupReference("Genesis 1:1-10");
scriptures.lookupReference("Exodus 1-2:15");
scriptures.lookupReference("Leviticus 1:10-4:5");

//H
scriptures.lookupReference("Doctrine and Covenants 132:1-5");
*/