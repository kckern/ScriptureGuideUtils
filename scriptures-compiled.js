"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var lang = null;
var wordBreak = "\\b";
var lang_extra = {};
var raw_index = require('./data/scriptdata.js');
var raw_regex = require('./data/scriptregex.js');
var refIndex = null;
var verseIdIndex = null;
var orginal_raw_index = _objectSpread({}, raw_index);
var orginal_raw_regex = _objectSpread({}, raw_regex);
var raw_lang = require('./data/scriptlang.js');
var _require = require('./data/scriptdetect.js'),
  prepareBlacklist = _require.prepareBlacklist,
  preparePattern = _require.preparePattern,
  processReferenceDetection = _require.processReferenceDetection;
var setLanguage = function setLanguage(language) {
  var _raw_lang$lang, _raw_lang$lang2, _raw_lang$lang3, _raw_lang$lang4, _raw_lang$lang5, _raw_lang$lang6;
  if (lang === language) return; // console.log(`Language already set to ${lang}`);
  lang = language;
  refIndex = null;
  verseIdIndex = null;
  if (!lang || !(raw_lang !== null && raw_lang !== void 0 && raw_lang[lang])) {
    //revert to originals
    raw_index = _objectSpread({}, orginal_raw_index);
    raw_regex = _objectSpread({}, orginal_raw_regex);
    lang_extra = {};
    wordBreak = "\\b"; //TODO get from lang config?
    return;
  }
  if ((_raw_lang$lang = raw_lang[lang]) !== null && _raw_lang$lang !== void 0 && _raw_lang$lang.books) {
    raw_regex.books = [];
    var new_index = {};
    var bookList = Object.keys(raw_lang[lang].books);
    var _loop = function _loop() {
      var _Object$keys;
      var book = _bookList[_i];
      var book_index = bookList.indexOf(book);
      var original_bookname = (_Object$keys = Object.keys(orginal_raw_index)) === null || _Object$keys === void 0 ? void 0 : _Object$keys[book_index];
      new_index[book] = raw_index[original_bookname];
      var matches = [book].concat(_toConsumableArray(raw_lang[lang].books[book])); //TODO, do I need the book in the list?
      raw_regex.books = raw_regex.books.concat(matches.map(function (i) {
        return [i, book];
      }));
    };
    for (var _i = 0, _bookList = bookList; _i < _bookList.length; _i++) {
      _loop();
    }
    raw_index = new_index;
  }
  raw_regex.pre_rules = ((_raw_lang$lang2 = raw_lang[lang]) === null || _raw_lang$lang2 === void 0 ? void 0 : _raw_lang$lang2.pre_rules) || raw_regex.pre_rules; //TODO: add replace/append options
  raw_regex.post_rules = ((_raw_lang$lang3 = raw_lang[lang]) === null || _raw_lang$lang3 === void 0 ? void 0 : _raw_lang$lang3.post_rules) || raw_regex.post_rules; //TODO: add replace/append options
  raw_regex.spacing = ((_raw_lang$lang4 = raw_lang[lang]) === null || _raw_lang$lang4 === void 0 ? void 0 : _raw_lang$lang4.spacing) || ["", ""]; //TODO: Set spacing

  //TODO: Set booksWithDashRegex

  if ((_raw_lang$lang5 = raw_lang[lang]) !== null && _raw_lang$lang5 !== void 0 && _raw_lang$lang5.matchRules) lang_extra = (_raw_lang$lang6 = raw_lang[lang]) === null || _raw_lang$lang6 === void 0 ? void 0 : _raw_lang$lang6.matchRules;
};
var lookupReference = function lookupReference(query) {
  var _verse_ids;
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
  for (var i in refs) {
    verse_ids = verse_ids.concat(lookupSingleRef(refs[i]));
  }
  if (!((_verse_ids = verse_ids) !== null && _verse_ids !== void 0 && _verse_ids.length) && lang) {
    var original_lang = lang + ""; //clone
    //try again with no language
    setLanguage(null);
    var results = lookupReference(query);
    setLanguage(original_lang);
    return results;
  }
  return {
    "query": query,
    "ref": ref,
    // "gen": generateReference(verse_ids),
    "verse_ids": verse_ids
  };
};
var lookupSingleRef = function lookupSingleRef(ref) {
  var booksWithDashRegex = /^(joseph|조셉)/i; // TODO: get from lang config
  //todo: better handling of multi-book ranges for unicode
  if (!booksWithDashRegex.test(ref) && ref.match(/[—-](\d\s)*[\D]/ig)) return lookupMultiBookRange(ref);
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
  var ref = refs.join("; ");
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
      // console.log(range);
    } else {
      var _maxverse = loadMaxVerse(cleanReference(matches[1]), matches[2]);
      range[1] = range[1] + ":" + _maxverse;
    }
  }
  var start = lookupSingleRef(range[0])[0];
  var end = lookupSingleRef(range[1])[0];
  var all_verse_ids = [];
  for (var i = start; i <= end; i++) all_verse_ids.push(i);
  return all_verse_ids;
};
var strToHash = function strToHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = hash * 31 + str.charCodeAt(i);
    //max 32
    if (hash > 2147483647) hash = hash % 2147483647;
  }
  return "==".concat(hash, "==");
};
var cleanReference = function cleanReference(messyReference) {
  var ref = messyReference.replace(/[\s]+/g, " ").trim();

  //Build Regex rules
  var regex = raw_regex.pre_rules;
  for (var i in regex) {
    var re = new RegExp(regex[i][0], "ig");
    ref = ref.replace(re, regex[i][1]);
  }

  //Turn dots into colons
  ref = ref.replace(/(\d+)[.](\d+)/g, "$1:$2");
  ref = ref.replace(/[.]/g, "");

  //Treat commas as semicolons in the absence of verses
  //add spaces after semicolons
  ref = ref.replace(/;/g, "; ");
  //add space before numbers
  ref = ref.replace(/^([0-9;,:-]+)(\d+)/g, "$1 $2");
  //spaces around book ranges !!! Breaks vietnamese, which uses dashes (optionally) instead of spaces in book names
  ref = ref.replace(/([–-])(\D+)/g, " $1 $2 ");

  //Handle non-latin languages because \b only works for latin alphabet
  var _ref = raw_regex.spacing || ["\\b", ""],
    _ref2 = _slicedToArray(_ref, 2),
    wordBreak = _ref2[0],
    buffer = _ref2[1];
  var srcbooks = raw_regex.books;
  var dstbooks = buffer ? raw_regex.books.map(function (i) {
    return [i[1], i[1]];
  }) : [];
  var bookMatchList = [].concat(_toConsumableArray(dstbooks), _toConsumableArray(srcbooks)).sort(function (a, b) {
    return b[0].length - a[0].length;
  });
  regex = bookMatchList;
  var hashCypher = {};
  for (var _i2 in regex) {
    var _regex$_i = _slicedToArray(regex[_i2], 2),
      book = _regex$_i[1];
    var hash = strToHash(book);
    hashCypher[book] = hash;
  }
  for (var _i3 in regex) {
    var re = new RegExp(wordBreak + buffer + regex[_i3][0] + buffer + "\\.*" + wordBreak, "ig");
    var replacement = hashCypher[regex[_i3][1]] || regex[_i3][1];
    ref = (buffer + ref + buffer).replace(re, replacement).trim();
  }
  var books = Object.keys(hashCypher);
  var hashes = Object.values(hashCypher);
  ref = ref.replace(new RegExp(hashes.join("|"), "g"), function (match) {
    var bookValue = books[hashes.indexOf(match)];
    return bookValue + " ";
  });

  //Cleanup
  ref = ref.replace(/\s+/g, " "); //remove double spaces
  ref = ref.replace(/\s*[~–-]\s*/g, "-"); //remove spaces around dashes
  ref = ref.replace(/;(\S+)/g, "; $1"); //add space after semicolons

  var cleanReference = ref.trim();
  cleanReference = handleSingleChapterBookRefs(cleanReference);
  if (!cleanReference.match(/:/)) cleanReference = cleanReference.replace(/,/, "; ");
  return cleanReference;
};
var handleSingleChapterBookRefs = function handleSingleChapterBookRefs(ref) {
  var singleChapterBooks = Object.keys(raw_index).filter(function (book) {
    return loadMaxChapter(book) == 1;
  });
  var _singleChapterBooks$f = singleChapterBooks.filter(function (book) {
      return ref.match(new RegExp("^".concat(book, " \\d+")));
    }),
    _singleChapterBooks$f2 = _slicedToArray(_singleChapterBooks$f, 1),
    matchingBook = _singleChapterBooks$f2[0];
  if (new RegExp("^".concat(matchingBook, " 1:")).test(ref)) return ref;
  if (new RegExp("^".concat(matchingBook, " 1$")).test(ref)) return ref;
  ref = ref.replace(new RegExp("^".concat(matchingBook, " (\\d+)")), "".concat(matchingBook, " 1:$1"));
  return ref;
};
var splitReferences = function splitReferences(compoundReference) {
  var refs = compoundReference.split(/\s*;\s*/);
  var runningBook = "";
  var completeRefs = [];
  for (var i in refs) {
    var ref = refs[i];
    var pieces = ref.split(/([0-9:,-]+)$/);
    var firstPiece = pieces[0].trim();
    runningBook = bookExists(firstPiece) ? firstPiece : runningBook;
    var needsPreBook = !bookExists(firstPiece);
    var preBook = needsPreBook && runningBook ? runningBook : "";
    completeRefs.push((preBook + " " + ref).trim());
  }
  return completeRefs;
};
var getBook = function getBook(ref) {
  var book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
  book = book.replace(/-/g, "—");
  if (bookExists(book)) return book;
  return false;
};
var getRanges = function getRanges(ref) {
  var ranges = [];
  var numbers = ref.replace(/.*?([0-9: ,-]+)$/, '$1').trim();
  numbers = numbers.replace(/^(\d+)-(\d+):(\d+)$/g, '$1:1-$2:$3'); //implict first verse
  var isChaptersOnly = numbers.match(/:/) ? false : true;
  var isRange = !numbers.match(/-/) ? false : true;
  var isSplit = !numbers.match(/,/) ? false : true;
  // Genesis 1,3-5
  if (isChaptersOnly && isSplit && isRange) {
    var chapterRanges = numbers.split(/,/);
    for (var i in chapterRanges) {
      //3-5
      if (chapterRanges[i].match(/-/)) {
        var chapterStartandEnd = chapterRanges[i].split(/-/);
        var startChapter = parseInt(chapterStartandEnd[0], 0);
        var endChapter = parseInt(chapterStartandEnd[1], 0);
        var chapterRange = [];
        for (leti = startChapter; i <= endChapter; i++) {
          ranges.push(i + ": 1-X");
        }
      }
      //1
      else {
        ranges.push(chapterRanges[i] + ": 1-X");
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
  //Genesis 1-2 (ch-ch)
  else if (isChaptersOnly && isRange) {
    var _chapterStartandEnd = numbers.split(/-/);
    var _startChapter = parseInt(_chapterStartandEnd[0], 0);
    var _endChapter = parseInt(_chapterStartandEnd[1], 0);
    var _chapterRange = [];
    for (var _i4 = _startChapter; _i4 <= _endChapter; _i4++) {
      _chapterRange.push(_i4);
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
    var chapter = null;
    var verses = null;
    for (var _i5 in split) {
      // 2:2   OR   1:1-4
      if (split[_i5].match(/:/)) {
        var pieces = split[_i5].split(/:/);
        chapter = mostRecentChapter = pieces[0];
        verses = pieces[1];
      }
      //3   or 6-7
      else {
        chapter = mostRecentChapter;
        verses = split[_i5];
      }
      ranges.push(chapter + ": " + verses.trim());
    }
  }
  // Genesis 1:3,5
  else if (isSplit) {
    var _split = numbers.split(/,/);
    var _mostRecentChapter = null;
    var _chapter = null;
    var _verses = null;
    for (var _i6 in _split) {
      //Genesis 1:1-5
      if (_split[_i6].match(/:/)) {
        var _pieces = numbers.split(/:/);
        _chapter = _mostRecentChapter = _pieces[0];
        _verses = _pieces[1];
      }
      //10
      else {
        _chapter = _mostRecentChapter;
        _verses = _split[_i6];
      }
      ranges.push(_chapter + ": " + _verses.trim());
    }
  }
  //Genesis 1:1-10 (cv-v)    OR    Exodus 1-2:15 (c-cv)  OR Leviticus 1:10-2:5 (cv-cv)
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
    for (var _i7 = _chapters[0]; _i7 <= _chapters[1]; _i7++) {
      var start = 1;
      var end = "X";
      if (_chapters[0] == _i7) start = _verses2[0];
      if (_chapters[1] == _i7) end = _verses2[_verses2.length - 1];
      ranges.push(_i7 + ": " + start + "-" + end);
    }
  } else {
    ranges = [numbers];
  }
  ;
  return ranges;
};
var loadVerseIds = function loadVerseIds(book, ranges) {
  if (refIndex == null) refIndex = loadRefIndex();
  var verseList = [];
  for (var i in ranges)
  //Assumption: 1 range is within a single chapter
  {
    var range = ranges[i];
    var matches = range.match(/(\d+): *([\dX]+)-*([\dX]*)/);
    if (!matches) continue;
    var chapter = parseInt(matches[1]);
    var start = parseInt(matches[2]);
    var end = matches[3];
    if (end == '') end = start;
    if (end == "X") end = loadMaxVerse(book, chapter);else end = parseInt(end);
    for (var verse_num = start; verse_num <= end; verse_num++) {
      if (refIndex[book] == undefined) continue;
      if (refIndex[book][chapter] == undefined) continue;
      if (refIndex[book][chapter][verse_num] == undefined) continue;
      verseList.push(refIndex[book][chapter][verse_num]);
    }
  }
  return verseList;
};
var loadVerseStructure = function loadVerseStructure(verse_ids) {
  if (verseIdIndex == null) verseIdIndex = loadVerseIdIndex();
  var segments = consecutiveSplitter(verse_ids);
  var structure = [];
  for (var i in segments) {
    var min = segments[i][0];
    var max = segments[i][segments[i].length - 1];
    structure.push([verseIdIndex[min], verseIdIndex[max]]);
  }
  return structure;
};
var consecutiveSplitter = function consecutiveSplitter(verse_ids) {
  var segments = [];
  var segment = [];
  var previousVerseId = 0;
  for (var i in verse_ids) {
    if (verse_ids[i] != previousVerseId + 1 && previousVerseId != 0) {
      segments.push(segment);
      segment = [];
    }
    segment.push(verse_ids[i]);
    previousVerseId = verse_ids[i];
  }
  segments.push(segment);
  return segments;
};
var loadRefsFromRanges = function loadRefsFromRanges(ranges) {
  var refs = [];
  var mostRecentBook, mostRecentChapter;
  for (var i in ranges) {
    var ref = '';
    var start_bk = ranges[i][0][0];
    var end_bk = ranges[i][1][0];
    var start_ch = ranges[i][0][1];
    var end_ch = ranges[i][1][1];
    var start_vs = ranges[i][0][2];
    var end_vs = ranges[i][1][2];
    if (start_bk == end_bk) {
      if (start_ch == end_ch) {
        if (start_bk == mostRecentBook) start_bk = '';
        if (start_bk == mostRecentBook && start_ch == mostRecentChapter) start_ch = '';
        if (start_vs == end_vs) {
          ref = start_bk + " " + start_ch + ":" + start_vs;
        } else {
          if (start_vs == 1 && end_vs == loadMaxVerse(start_bk, start_ch))
            //whole chapter
            {
              ref = start_bk + " " + start_ch;
            } else {
            ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_vs;
          }
        }
      } else {
        if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch)) {
          ref = start_bk + " " + start_ch + "-" + end_ch;
        } else {
          ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_ch + ":" + end_vs;
        }
      }
    } else {
      if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch)) {
        ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch;
      } else if (end_vs == loadMaxVerse(end_bk, end_ch)) {
        ref = start_bk + " " + start_ch + ":" + start_vs + " - " + end_bk + " " + end_ch;
      } else if (start_vs == 1) {
        ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch + ":" + end_vs;
      } else {
        ref = start_bk + " " + start_ch + ":" + start_vs + " - " + end_bk + " " + end_ch + ":" + end_vs;
      }
    }
    if (start_bk != '') mostRecentBook = start_bk;
    if (start_ch != '') mostRecentChapter = start_ch;
    ref = ref.replace(/^\s+:*/, '').trim();
    refs.push(ref);
  }
  return refs;
};
var loadRefIndex = function loadRefIndex() {
  var refIndex = {};
  var verse_id = 1;
  var book_list = Object.keys(raw_index);
  //if(raw_lang[lang]?.books) book_list = raw_lang[lang].books
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
var detectReferences = function detectReferences(content, callBack) {
  callBack = callBack ? callBack : function (i) {
    return "[".concat(i, "]");
  };
  var src = raw_regex.books.map(function (i) {
    return i[0];
  });
  var dst = _toConsumableArray(new Set(raw_regex.books.map(function (i) {
    return i[1];
  })));
  var books = [].concat(_toConsumableArray(dst), _toConsumableArray(src));
  return processReferenceDetection(content, books, lang_extra, lookupReference, callBack);
};
module.exports = {
  lookupReference: lookupReference,
  generateReference: generateReference,
  setLanguage: setLanguage,
  detectReferences: detectReferences,
  //Aliases for convenience
  lang: setLanguage,
  language: setLanguage,
  setLang: setLanguage,
  lookup: lookupReference,
  parse: lookupReference,
  read: lookupReference,
  ref2VerseId: lookupReference,
  ref: generateReference,
  gen: generateReference,
  generate: generateReference,
  verseId2Ref: generateReference,
  detect: detectReferences,
  detectScriptureReferences: detectReferences,
  detectRefs: detectReferences,
  detectScriptures: detectReferences,
  linkRefs: detectReferences
};
