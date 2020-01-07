

# Scripture Reference Parser

This universal scripture reference parser is designed to lookup any reference to a scriptural text and return the corresponding verse ids.  These verse ids can then be used to query a database using a verse id index, such as those found on https://scriptures.nephi.org/

## Scripture Reference Conventions
Scripture references generally follow standard conventions for citing the Bible. Various style guides have different conventions for citing the bible, but they are all generally recgoniziable by the elements of `Book`, `Chapter`, and `Verse`. Multiple reference types exist for citing various combinations of book, verse, or chapter ranges,  discreet passages, and non-sequential verses within a single chapter or book, or across multiple chapters and/or books.

## Prerequisites

 - This scripture reference parser executes in a JavaScript envrionment.  (Both NodeJS and major browsers supported)

## Installing

### NPM Installation
### Minified Installation
### Manual Installation

## INPUT—Supported Reference Types
|**Reference Type**|**Example**  |
|--|--|
|Simple reference | Exodus 1:1 |
| Simple chapter | Genesis 2 |
| Split chapters  |  Genesis 1,3 |
| Chapter range | Exodus 3-5 |
| Chapter range and split | Exodus 3-5,8 |
| Verse range | Exodus 20:1-10 |
| Verse range and split | Exodus 20:1-5,10 |
| Verse Split | Exodus 20:5,10 |
| Verse range spanning multiple chapters | Exodus 1:5-4:3 |
| Chapter range ending in partial chapter | Exodus 3-4:10 |
| Chapter range spanning multiple books | Genesis 30 - Exodus 2 |
| Chapter range spanning multiple books, ending in partial chapter | Genesis 30 - Exodus 2:5 |
| Chapter range spanning multiple books, starting in partial chapter | Genesis 30:10 - Exodus 2 |
| Chapter range spanning multiple books, starting and ending with partial chapters | Genesis 30:10 - Exodus 2:5 |
| Compound reference in same book | Exodus 5:1;6:2;8:5 |
| Compound reference in different books | Exodus 5:1; Leviticus 6:2; Numbers 8:5 |
| Compound reference ranges in different books | Exodus 5:1-3; Leviticus 6:2-5; Numbers 8:5-6 |
| Entire Book Range | Genesis - Numbers |
| Abbreviation detection | Mt 2.5; Mk 3; Lk 4; Jn 5.2-6; 1 Jn1.5,7-8; 3 Jn1.1 |

###  Example
A scripture reference `string` is passed into the `scripture` object’s `lookup()` function like this:
```js
let results = scripture.lookup('Ex 20.5,10');
```

## OUTPUT—Verse IDs
The function will return a `json` object containing the following:
 - `query`: the user-provided input string (*what was said*)
 - `ref`: the parsed, interpreted reference string (*what was meant*)
 - `verse_ids`: the resuluting array containing the verse ID integers corresponding to the input query

```json
{
	query: 'Ex 20.5,10',
	ref: 'Exodus 20:5, 10',
	verse_ids: [ 2057, 2062 ]
}
```

## Using Verse IDs

 - Verse IDs are intended to be used to query a scripture database.  (Database not included).
 - Verse IDs are calculated as a function of number of verses away from `Genesis 1:1`, inclusive, using the conventionally standard sequence of books, chapters, and verses.

### Example Verse IDs:
|Verse|Verse ID|
|--|--|
|Genesis 1:1| 1 |
|Genesis 1:2| 2 |
|Genesis 1:10| 10 |
|Genesis 1:31| 31 |
|Genesis 2:1| 32 |
|Genesis 50:26| 1533 |
|Exodus 1:1| 1534 |
|Exodus 1:2| 1535 |
|Malichi 4:6| 23145 |

See also: Master Verse ID list


### Example Database Usage:
Assuming a `verse_id`–index database table named `scripture_verses` exists
```sql
SELECT * FROM `scripture_verses` WHERE verse_id IN (2057, 2062);
```
This query will enable the retrieval of the text associated with the input reference, mediated by verse IDs.

### Customizing Verse IDs

 - The `data/scriptdata.json` file contains the sequential index from which verse_ids are calculated.
 - If needed, this file may be edited to correspond to a difference database index
 - The data structure is:
```json
{
	"Book 1 Name": 
		[
			'verse count (int) of chapter 1',
			'verse count (int) of chapter 2',
			'verse count (int) of chapter 3',
			'verse count (int) of chapter 4'
		],
	"Book 2 Name": 
		[
			'verse count (int) of chapter 1',
			'verse count (int) of chapter 2',
			'verse count (int) of chapter 3'
		],
}
```
Following this structure,

## Authors

* **KC Kern** - *Initial work* - [kckern](https://github.com/kckern)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

