const scriptutil = require("./scriptutil.js")

const lookupReference = function (query) {
    //Cleanup
    ref = scriptutil.cleanReference(query);
    //Break compound reference into array of single references
    let refs = scriptutil.splitReferences(ref);

    //Lookup each single reference individually, return the set
    verse_ids = [];
    for (let i in refs) {
        verse_ids = verse_ids.concat(lookupSingleRef(refs[i]));
    }
    return { "query": query, "ref": ref, "verse_ids": verse_ids };
}

const lookupSingleRef = function (ref) {


    if (false) return lookupMultiBookRange(cleanRef);
    let book = scriptutil.getBook(ref);
    if (!book) return [];
    let ranges = scriptutil.getRanges(ref, book);
    let verse_ids = scriptutil.loadVerseIds(book, ranges);
    return verse_ids;

}

const generateReference = function (verse_ids) {

    let ranges = scriptutil.loadVerseStructure(verse_ids);
    let refs = scriptutil.loadRefsFromRanges(ranges);
    ref = refs.join("; ");
    return ref;

}




const lookupMultiBookRange = function (cleanRef) {
    console.log("Looking up Single Reference")

    /*
    			$range = explode("-",$ref);
	
				if(!stristr(":",$range[1]))
				{
					preg_match("/(.*?)\s(\d+)$/",$range[1],$matches);
					$maxverse = scriptutil::loadChapterMax(scriptutil::cleanReference($matches[1]),$matches[2]);
					
					$range[1] .= ":$maxverse";
				}
				foreach($range as $i=>$point)
				{
					$meta = self::lookup($point,array('meta_only' => 1));
					$verse_ids[$i] = $meta[0]['verse_ids'][0];
				}
				
				for($i=$verse_ids[0]; $i<=$verse_ids[1]; $i++) $all_verse_ids[] = $i;
				
				
			
				$tmp = array("orig"=>trim($ref),"book"=>"Multi","verse_ids"=>$all_verse_ids);
	
				$return[] =  $tmp;
                continue;
     */
}



module.exports = { lookupReference, generateReference }