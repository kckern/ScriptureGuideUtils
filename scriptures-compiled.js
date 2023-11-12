"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
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
  preparePattern = _require.preparePattern;
var postProcess = function postProcess(i) {
  return i;
};
var preProcess = function preProcess(i) {
  return i;
};
var setLanguage = function setLanguage(language) {
  var _raw_lang$lang, _raw_lang$lang2, _raw_lang$lang3, _raw_lang$lang4, _raw_lang$lang5, _raw_lang$lang6, _raw_lang$lang7, _raw_lang$lang8;
  if (lang === language) return;
  lang = language;
  refIndex = null;
  verseIdIndex = null;
  if (!lang || !(raw_lang !== null && raw_lang !== void 0 && raw_lang[lang])) {
    //revert to originals
    raw_index = _objectSpread({}, orginal_raw_index);
    raw_regex = _objectSpread({}, orginal_raw_regex);
    postProcess = function postProcess(i) {
      return i;
    };
    preProcess = function preProcess(i) {
      return i;
    };
    lang_extra = {};
    wordBreak = "\\b";
    return;
  }
  var new_index = {};
  if ((_raw_lang$lang = raw_lang[lang]) !== null && _raw_lang$lang !== void 0 && _raw_lang$lang.books) {
    for (var i in raw_lang[lang].books) {
      var _Object$keys;
      var book = raw_lang[lang].books[i];
      var original_book = (_Object$keys = Object.keys(raw_index)) === null || _Object$keys === void 0 ? void 0 : _Object$keys[i];
      new_index[book] = raw_index[original_book];
    }
    raw_index = new_index;
  }
  //if(raw_lang[lang]?.regex) raw_regex.books = [];
  var _iterator = _createForOfIteratorHelper((_raw_lang$lang8 = raw_lang[lang]) === null || _raw_lang$lang8 === void 0 ? void 0 : _raw_lang$lang8.regex),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var regexitem = _step.value;
      raw_regex.books.push(regexitem);
    }

    //if(raw_lang[lang]?.wordBreak==-1) wordBreak = "";
    //else wordBreak = raw_lang[lang]?.wordBreak || wordBreak;
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if ((_raw_lang$lang2 = raw_lang[lang]) !== null && _raw_lang$lang2 !== void 0 && _raw_lang$lang2.postProcess) postProcess = (_raw_lang$lang3 = raw_lang[lang]) === null || _raw_lang$lang3 === void 0 ? void 0 : _raw_lang$lang3.postProcess;
  if (typeof postProcess !== 'function') postProcess = function postProcess(i) {
    return i;
  };
  if ((_raw_lang$lang4 = raw_lang[lang]) !== null && _raw_lang$lang4 !== void 0 && _raw_lang$lang4.preProcess) preProcess = (_raw_lang$lang5 = raw_lang[lang]) === null || _raw_lang$lang5 === void 0 ? void 0 : _raw_lang$lang5.preProcess;
  if (typeof preProcess !== 'function') preProcess = function preProcess(i) {
    return i;
  };
  if ((_raw_lang$lang6 = raw_lang[lang]) !== null && _raw_lang$lang6 !== void 0 && _raw_lang$lang6.matchRules) lang_extra = (_raw_lang$lang7 = raw_lang[lang]) === null || _raw_lang$lang7 === void 0 ? void 0 : _raw_lang$lang7.matchRules;
};
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
  for (var i in refs) {
    verse_ids = verse_ids.concat(lookupSingleRef(refs[i]));
  }
  return {
    "query": query,
    "ref": ref,
    //"gen": generateReference(verse_ids),
    "verse_ids": verse_ids
  };
};
var lookupSingleRef = function lookupSingleRef(ref) {
  //todo: better handling of multi-book ranges for unicode
  if (ref.match(/[—-](\d\s)*[A-Za-z\u3131-\uD79D]/ig)) return lookupMultiBookRange(ref);
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
  var refs = loadRefsFromRanges(ranges).map(postProcess);
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
      console.log(range);
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
  return "::".concat(hash, "::");
};
var cleanReference = function cleanReference(messyReference) {
  var ref = messyReference.replace(/[\s]+/g, " ").trim();
  var hasNoAlpha = !/[A-Za-z]/.test(ref);
  if (hasNoAlpha) wordBreak = "";
  ref = preProcess(ref);

  //Build Regex rules
  var regex = raw_regex.pre_rules;
  for (var i in regex) {
    var re = new RegExp(regex[i][0], "ig");
    ref = ref.replace(re, regex[i][1]);
  }
  var srcbooks = raw_regex.books;
  var dstbooks = raw_regex.books.map(function (i) {
    return [i[1], i[1]];
  });
  var bookMatchList = [].concat(_toConsumableArray(dstbooks), _toConsumableArray(srcbooks)).sort(function (a, b) {
    return b[0].length - a[0].length;
  });
  regex = bookMatchList;
  var hashCypher = {};
  for (var _i in regex) {
    var _regex$_i = _slicedToArray(regex[_i], 2),
      book = _regex$_i[1];
    var hash = strToHash(book);
    hashCypher[book] = hash;
  }
  var buffer = wordBreak ? "" : " ";
  for (var _i2 in regex) {
    var re = new RegExp(wordBreak + buffer + regex[_i2][0] + buffer + "\\.*" + wordBreak, "ig");
    var replacement = hashCypher[regex[_i2][1]] || regex[_i2][1];
    ref = (buffer + ref + buffer).replace(re, replacement).trim();
  }
  var books = Object.keys(hashCypher);
  var hashes = Object.values(hashCypher);
  ref = ref.replace(new RegExp(hashes.join("|"), "g"), function (match) {
    var bookValue = books[hashes.indexOf(match)];
    return bookValue + " ";
  });
  regex = raw_regex.post_rules;
  for (var _i3 in regex) {
    var re = new RegExp(regex[_i3][0], "ig");
    ref = ref.replace(re, regex[_i3][1]);
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
  for (var i in refs) {
    var pieces = refs[i].split(/([0-9:,-]+)$/);
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
  //Genesis 1-2
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
  var _content$match;
  var wordBreak = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "\\b";
  callBack = callBack ? callBack : function (i) {
    return "[".concat(i, "]");
  };
  var trimExternalMatchStrings = function trimExternalMatchStrings(i) {
    return i.trim().replace(/^[^0-9]*\(/g, '').replace(/\)[^0-9]*$/g, '').replace(/[,;!?.()]+$/ig, "").replace(/^[,;!?.()]+/ig, " ").trim();
  };
  var hasNoAlpha = !/[A-Za-z]/.test(content);
  if (hasNoAlpha && wordBreak) wordBreak = "";
  var src = raw_regex.books.map(function (i) {
    return i[0];
  });
  var dst = _toConsumableArray(new Set(raw_regex.books.map(function (i) {
    return i[1];
  })));
  var bookMatchList = [].concat(_toConsumableArray(dst), _toConsumableArray(src)).map(function (i) {
    return [i];
  });
  var pattern = preparePattern(bookMatchList, wordBreak, lang_extra);
  var blacklist_pattern = prepareBlacklist();
  var matches = ((_content$match = content.match(pattern)) === null || _content$match === void 0 ? void 0 : _content$match.filter(function (i) {
    return !blacklist_pattern.test(i);
  })) || [];
  matches = matches.map(trimExternalMatchStrings);
  matches = matches.filter(function (i) {
    return i.length <= 1000;
  });

  // split by matches
  var pieces;
  try {
    pieces = matches.length ? content.split(new RegExp("(".concat(matches.join("|"), ")"), "ig")) : [content];
  } catch (error) {
    console.error(error);
    console.log({
      matches: matches,
      pattern: pattern
    });
    return content;
  }
  content = pieces.map(function (i, j) {
    if (j % 2 == 0) return i;
    return callBack(i);
  }).join("").replace(/\s+/g, " ").trim();
  return content;
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
  detectRefs: detectReferences,
  detectScriptures: detectReferences,
  linkRefs: detectReferences
};
