"use strict";

var raw_index = require('./data/scriptdata.js');
var raw_regex = require('./data/scriptregex.js');
var lookupReference = function lookupReference(query) {
  var isValidReference = query && typeof query === 'string' && query.length > 0;
  if (!isValidReference) return {
    "query": query,
    "ref": "",
    "verse_ids": []
  };

  //Cleanup
  var ref = cleanReference(query);
  //Break compound reference into array of single references
  var refs = splitReferences(ref);

  //Lookup each single reference individually, return the set
  var verse_ids = [];
  for (var _i in refs) {
    verse_ids = verse_ids.concat(lookupSingleRef(refs[_i]));
  }
  return {
    "query": query,
    "ref": ref,
    "verse_ids": verse_ids
  };
};
var lookupSingleRef = function lookupSingleRef(ref) {
  if (ref.match(/[—-](\d\s)*[A-Za-z]/ig)) return lookupMultiBookRange(ref);
  var book = getBook(ref);
  if (!book) return [];
  var ranges = getRanges(ref, book);
  var verse_ids = loadVerseIds(book, ranges);
  return verse_ids;
};
var validateVerseIds = function validateVerseIds(verse_ids) {
  if (!verse_ids) return false;
  if (typeof verse_ids === 'string') verse_ids = verse_ids.split(/[,;]/);
  if (!Array.isArray(verse_ids)) verse_ids = [verse_ids];
  verse_ids = verse_ids.map(function (v) {
    return parseInt(v);
  });
  verse_ids = verse_ids.filter(function (v) {
    return !isNaN(v);
  });
  if (verse_ids.length == 0) return false;
  //if array of non zero integers
  if (verse_ids.filter(function (v) {
    return v > 0;
  }).length == verse_ids.length) return verse_ids;
  return false;
};
var generateReference = function generateReference(verse_ids) {
  verse_ids = validateVerseIds(verse_ids);
  if (!verse_ids) return '';
  var ranges = loadVerseStructure(verse_ids);
  var refs = loadRefsFromRanges(ranges);
  ref = refs.join("; ");
  return ref;
};
var lookupMultiBookRange = function lookupMultiBookRange(cleanRef) {
  //eg Matthew 15—Mark 2

  var range = cleanRef.split(/[—-]/);
  if (!range[0].match(/[:]/)) {
    if (range[0].match(/\d+\s*$/)) range[0] = range[0].trim() + ":" + 1;else range[0] = range[0].trim() + " 1:1";
  }
  if (!range[1].match(/[:]/)) {
    var matches = range[1].match(/(.*?)\s(\d+)$/);
    if (matches === null) {
      //find end of book
      var maxChapter = loadMaxChapter(range[1]);
      var maxverse = loadMaxVerse(range[1], maxChapter);
      range[1] = range[1] + " " + maxChapter + ":" + maxverse;
      console.log(range);
    } else {
      var _maxverse = loadMaxVerse(cleanReference(matches[1]), matches[2]);
      range[1] = range[1] + ":" + _maxverse;
    }
  }
  var start = lookupSingleRef(range[0])[0];
  var end = lookupSingleRef(range[1])[0];
  var all_verse_ids = [];
  for (var _i2 = start; _i2 <= end; _i2++) all_verse_ids.push(_i2);
  return all_verse_ids;
};
var cleanReference = function cleanReference(messyReference) {
  var ref = messyReference.trim();

  //Build Regex rules
  var regex = raw_regex.pre_rules;
  for (var _i3 in regex) {
    var re = new RegExp(regex[_i3][0], "ig");
    ref = ref.replace(re, regex[_i3][1]);
  }
  regex = raw_regex.books;
  //process book Fixes
  for (var _i4 in regex) {
    var re = new RegExp("\\b" + regex[_i4][0] + "\\.*\\b", "ig");
    ref = ref.replace(re, regex[_i4][1]);
  }
  regex = raw_regex.post_rules;
  for (var _i5 in regex) {
    var re = new RegExp(regex[_i5][0], "ig");
    ref = ref.replace(re, regex[_i5][1]);
  }

  //Treat commas as semicolons in the absence of verses
  if (!ref.match(/:/)) ref = ref.replace(/,/, ";");
  var cleanReference = ref.trim();
  return cleanReference;
};
var splitReferences = function splitReferences(compoundReference) {
  var refs = compoundReference.split(/\s*;\s*/);
  var runningBook = null;
  var completeRefs = [];
  for (var _i6 in refs) {
    var pieces = refs[_i6].split(/([0-9:,-]+)$/);
    if (pieces[0].length > 0) runningBook = pieces[0].trim();
    if (pieces[1] == undefined) pieces[1] = '';
    completeRefs.push((runningBook + " " + pieces[1]).trim());
  }
  return completeRefs;
};
var getBook = function getBook(ref) {
  var book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
  if (bookExists(book)) return book;
  return false;
};
var getRanges = function getRanges(ref) {
  var ranges = [];
  var numbers = ref.replace(/.*?([0-9: ,-]+)$/, '$1').trim();
  var isChaptersOnly = numbers.match(/:/) ? false : true;
  var isRange = !numbers.match(/-/) ? false : true;
  var isSplit = !numbers.match(/,/) ? false : true;
  // Genesis 1,3-5
  if (isChaptersOnly && isSplit && isRange) {
    var chapterRanges = numbers.split(/,/);
    for (var _i7 in chapterRanges) {
      //3-5
      if (chapterRanges[_i7].match(/-/)) {
        var chapterStartandEnd = chapterRanges[_i7].split(/-/);
        var startChapter = parseInt(chapterStartandEnd[0], 0);
        var endChapter = parseInt(chapterStartandEnd[1], 0);
        var chapterRange = [];
        for (_i7 = startChapter; _i7 <= endChapter; _i7++) {
          ranges.push(_i7 + ": 1-X");
        }
      }
      //1
      else {
        ranges.push(chapterRanges[_i7] + ": 1-X");
      }
    }
  }
  // Genesis 1,3
  else if (isChaptersOnly && isSplit) {
    var chapters = numbers.split(/,/);
    ranges = chapters.map(function (chapter) {
      return chapter + ": 1-X";
    });
  }
  //Genesis 1-2
  else if (isChaptersOnly && isRange) {
    var _chapterStartandEnd = numbers.split(/-/);
    var _startChapter = parseInt(_chapterStartandEnd[0], 0);
    var _endChapter = parseInt(_chapterStartandEnd[1], 0);
    var _chapterRange = [];
    for (i = _startChapter; i <= _endChapter; i++) {
      _chapterRange.push(i);
    }
    ranges = _chapterRange.map(function (chapter) {
      return chapter + ": 1-X";
    });
  }
  //Genesis 1
  else if (isChaptersOnly) {
    ranges = [numbers + ": 1-X"];
  }
  //Genesis 1:1-5,10   
  else if (isRange && isSplit) {
    var mostRecentChapter = null;
    var split = numbers.split(/,/);
    var verses = null;
    for (var _i8 in split) {
      // 2:2   OR   1:1-4
      if (split[_i8].match(/:/)) {
        var pieces = split[_i8].split(/:/);
        chapter = mostRecentChapter = pieces[0];
        verses = pieces[1];
      }
      //3   or 6-7
      else {
        chapter = mostRecentChapter;
        verses = split[_i8];
      }
      ranges.push(chapter + ": " + verses.trim());
    }
  }
  // Genesis 1:3,5
  else if (isSplit) {
    var _split = numbers.split(/,/);
    var _mostRecentChapter = null;
    var _verses = null;
    for (var _i9 in _split) {
      //Genesis 1:1-5
      if (_split[_i9].match(/:/)) {
        var _pieces = numbers.split(/:/);
        chapter = _mostRecentChapter = _pieces[0];
        _verses = _pieces[1];
      }
      //10
      else {
        chapter = _mostRecentChapter;
        _verses = _split[_i9];
      }
      ranges.push(chapter + ": " + _verses.trim());
    }
  }
  //Genesis 1:1-10    OR    Exodus 1-2:15  OR Leviticus 1:10-2:5
  else if (isRange) {
    var _chapters = numbers.match(/((\d+)[:]|^\d+)/g);
    var _verses2 = numbers.match(/[:-](\d+)/g);
    if (_chapters.length == 1) _chapters.push(_chapters[0]);
    _chapters = _chapters.map(function (c) {
      return parseInt(c.replace(/\D/g, '').trim());
    });
    _verses2 = _verses2.map(function (v) {
      return parseInt(v.replace(/\D/g, '').trim());
    });
    for (var _i10 = _chapters[0]; _i10 <= _chapters[1]; _i10++) {
      var start = 1;
      var end = "X";
      if (_chapters[0] == _i10) start = _verses2[0];
      if (_chapters[1] == _i10) end = _verses2[_verses2.length - 1];
      ranges.push(_i10 + ": " + start + "-" + end);
    }
  } else {
    ranges = [numbers];
  }
  return ranges;
};
var refIndex = null;
var verseIdIndex = null;
var loadVerseIds = function loadVerseIds(book, ranges) {
  if (refIndex == null) refIndex = loadRefIndex();
  var verseList = [];
  for (var _i11 in ranges)
  //Assumption: 1 range is within a single chapter
  {
    var range = ranges[_i11];
    var matches = range.match(/(\d+): *([\dX]+)-*([\dX]*)/);
    if (!matches) continue;
    var _chapter = parseInt(matches[1]);
    var start = parseInt(matches[2]);
    var end = matches[3];
    if (end == '') end = start;
    if (end == "X") end = loadMaxVerse(book, _chapter);else end = parseInt(end);
    for (var verse_num = start; verse_num <= end; verse_num++) {
      if (refIndex[book] == undefined) continue;
      if (refIndex[book][_chapter] == undefined) continue;
      if (refIndex[book][_chapter][verse_num] == undefined) continue;
      verseList.push(refIndex[book][_chapter][verse_num]);
    }
  }
  return verseList;
};
var loadVerseStructure = function loadVerseStructure(verse_ids) {
  if (verseIdIndex == null) verseIdIndex = loadVerseIdIndex();
  var segments = consecutiveSplitter(verse_ids);
  var structure = [];
  for (var _i12 in segments) {
    var min = segments[_i12][0];
    var max = segments[_i12][segments[_i12].length - 1];
    structure.push([verseIdIndex[min], verseIdIndex[max]]);
  }
  return structure;
};
var consecutiveSplitter = function consecutiveSplitter(verse_ids) {
  var segments = [];
  var segment = [];
  var previousVerseId = 0;
  for (var _i13 in verse_ids) {
    if (verse_ids[_i13] != previousVerseId + 1 && previousVerseId != 0) {
      segments.push(segment);
      segment = [];
    }
    segment.push(verse_ids[_i13]);
    previousVerseId = verse_ids[_i13];
  }
  segments.push(segment);
  return segments;
};
var loadRefsFromRanges = function loadRefsFromRanges(ranges) {
  var refs = [];
  var mostRecentBook, mostRecentChapter;
  for (var _i14 in ranges) {
    var _ref = '';
    var start_bk = ranges[_i14][0][0];
    var end_bk = ranges[_i14][1][0];
    var start_ch = ranges[_i14][0][1];
    var end_ch = ranges[_i14][1][1];
    var start_vs = ranges[_i14][0][2];
    var end_vs = ranges[_i14][1][2];
    if (start_bk == end_bk) {
      if (start_ch == end_ch) {
        if (start_bk == mostRecentBook) start_bk = '';
        if (start_bk == mostRecentBook && start_ch == mostRecentChapter) start_ch = '';
        if (start_vs == end_vs) {
          _ref = start_bk + " " + start_ch + ":" + start_vs;
        } else {
          if (start_vs == 1 && end_vs == loadMaxVerse(start_bk, start_ch))
            //whole chapter
            {
              _ref = start_bk + " " + start_ch;
            } else {
            _ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_vs;
          }
        }
      } else {
        if (start_vs == 1) {
          _ref = start_bk + " " + start_ch + "-" + end_ch + ":" + end_vs;
        } else {
          _ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_ch + ":" + end_vs;
        }
      }
    } else {
      if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch)) {
        _ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch;
      } else if (end_vs == loadMaxVerse(end_bk, end_ch)) {
        _ref = start_bk + " " + start_ch + ":" + start_vs + " - " + end_bk + " " + end_ch;
      } else if (start_vs == 1) {
        _ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch + ":" + end_vs;
      } else {
        _ref = start_bk + " " + start_ch + ":" + start_vs + " - " + end_bk + " " + end_ch + ":" + end_vs;
      }
    }
    if (start_bk != '') mostRecentBook = start_bk;
    if (start_ch != '') mostRecentChapter = start_ch;
    _ref = _ref.replace(/^\s+:*/, '').trim();
    refs.push(_ref);
  }
  return refs;
};
var loadRefIndex = function loadRefIndex() {
  var refIndex = {};
  var verse_id = 1;
  var book_list = Object.keys(raw_index);
  for (var a in book_list) {
    var book_title = book_list[a];
    refIndex[book_title] = {};
    for (var b in raw_index[book_title]) {
      var chapter_num = parseInt(b) + 1;
      var verse_max = raw_index[book_title][b];
      refIndex[book_title][chapter_num] = {};
      for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
        refIndex[book_title][chapter_num][verse_num] = verse_id;
        verse_id++;
      }
    }
  }
  return refIndex;
};
var loadVerseIdIndex = function loadVerseIdIndex() {
  var verseIdIndex = [null];
  var book_list = Object.keys(raw_index);
  for (var a in book_list) {
    var book_title = book_list[a];
    for (var b in raw_index[book_title]) {
      var chapter_num = parseInt(b) + 1;
      var verse_max = raw_index[book_title][b];
      for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
        verseIdIndex.push([book_title, chapter_num, verse_num]);
      }
    }
  }
  return verseIdIndex;
};
var bookExists = function bookExists(book) {
  if (raw_index[book] === undefined) return false;
  return true;
};
var loadMaxChapter = function loadMaxChapter(book) {
  if (!bookExists(book)) return 0;
  return raw_index[book].length;
};
var loadMaxVerse = function loadMaxVerse(book, chapter) {
  if (!bookExists(book)) return 0;
  return raw_index[book][parseInt(chapter) - 1];
};

//Aliases

module.exports = {
  lookupReference: lookupReference,
  generateReference: generateReference,
  //Aliases
  lookup: lookupReference,
  generate: generateReference,
  ref: generateReference,
  gen: generateReference,
  parse: lookupReference,
  read: lookupReference,
  verseId2Ref: generateReference,
  ref2VerseId: lookupReference
};
