function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.verseId2Ref = exports.setLanguage = exports.setLang = exports.ref2VerseId = exports.ref = exports.read = exports.parse = exports.lookupReference = exports.lookup = exports.linkRefs = exports.language = exports.lang = exports.generateReference = exports.generate = exports.gen = exports.detectScriptures = exports.detectScriptureReferences = exports.detectRefs = exports.detectReferences = import _scriptdata from "./data/scriptdata.js";
import _scriptregex from "./data/scriptregex.js";
import _scriptlang from "./data/scriptlang.js";
import { processReferenceDetection } from "./data/scriptdetect.js";
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// Browser localStorage key for language preference
var LANGUAGE_STORAGE_KEY = 'scriptureGuideUtils_language';

// Helper function to safely access localStorage
var getStoredLanguage = function getStoredLanguage() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY);
    }
  } catch (e) {
    // localStorage might not be available in some environments
  }
  return null;
};
var setStoredLanguage = function setStoredLanguage(language) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (language) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } else {
        localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      }
    }
  } catch (e) {
    // localStorage might not be available in some environments
  }
};

// Global default language (can be overridden by localStorage)
var defaultLanguage = null;
var setLanguage = function setLanguage(language) {
  defaultLanguage = language;
  setStoredLanguage(language);
};
var getEffectiveLanguage = function getEffectiveLanguage(explicitLanguage) {
  // Priority: explicit parameter > stored language > default language > 'en'
  return explicitLanguage || getStoredLanguage() || defaultLanguage || 'en';
};
var lookupReference = function lookupReference(query) {
  var _verse_ids;
  var language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var isValidReference = query && typeof query === 'string' && query.length > 0;
  if (!isValidReference) return {
    "query": query,
    "ref": "",
    "verse_ids": []
  };

  // Get effective language (explicit > stored > default > 'en')
  var effectiveLanguage = getEffectiveLanguage(language);
  var config = getLanguageConfig(effectiveLanguage);

  //Cleanup
  var ref = cleanReference(query, config);
  //Break compound reference into array of single references
  var refs = splitReferences(ref, config);

  //Lookup each single reference individually, return the set
  var verse_ids = [];
  for (var i in refs) {
    verse_ids = verse_ids.concat(lookupSingleRef(refs[i], config));
  }

  // Fallback to English if no results found and language was specified
  if (!((_verse_ids = verse_ids) !== null && _verse_ids !== void 0 && _verse_ids.length) && effectiveLanguage && effectiveLanguage !== 'en') {
    var results = lookupReference(query, 'en');
    return results;
  }
  return {
    "query": query,
    "ref": ref,
    "verse_ids": verse_ids
  };
};
var lookupSingleRef = function lookupSingleRef(ref, config) {
  var booksWithDashRegex = /^(joseph|조셉)/i; // TODO: get from config
  //todo: better handling of multi-book ranges for unicode
  if (!booksWithDashRegex.test(ref) && ref.match(/[—-](\d\s)*[\D]/ig)) return lookupMultiBookRange(ref, config);
  var book = getBook(ref, config);
  if (!book) return [];
  var ranges = getRanges(ref, book);
  var verse_ids = loadVerseIds(book, ranges, config);
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
  var language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  verse_ids = validateVerseIds(verse_ids);
  if (!verse_ids) return '';
  var effectiveLanguage = getEffectiveLanguage(language);
  var config = getLanguageConfig(effectiveLanguage);
  var ranges = loadVerseStructure(verse_ids, config);
  var refs = loadRefsFromRanges(ranges, config);
  var ref = refs.join("; ");
  return ref;
};
var lookupMultiBookRange = function lookupMultiBookRange(cleanRef, config) {
  //eg Matthew 15—Mark 2

  var range = cleanRef.split(/[—-]/);
  if (!range[0].match(/[:]/)) {
    if (range[0].match(/\d+\s*$/)) range[0] = range[0].trim() + ":" + 1;else range[0] = range[0].trim() + " 1:1";
  }
  if (!range[1].match(/[:]/)) {
    var matches = range[1].match(/(.*?)\s(\d+)$/);
    if (matches === null) {
      //find end of book
      var maxChapter = loadMaxChapter(range[1], config);
      var maxverse = loadMaxVerse(range[1], maxChapter, config);
      range[1] = range[1] + " " + maxChapter + ":" + maxverse;
      // console.log(range);
    } else {
      var _maxverse = loadMaxVerse(cleanReference(matches[1], config), matches[2], config);
      range[1] = range[1] + ":" + _maxverse;
    }
  }
  var start = lookupSingleRef(range[0], config)[0];
  var end = lookupSingleRef(range[1], config)[0];
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
var cleanReference = function cleanReference(messyReference, config) {
  var ref = messyReference.replace(/[\s]+/g, " ").trim();

  //Build Regex rules
  var regex = config.raw_regex.pre_rules;
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
  var _ref = config.raw_regex.spacing || ["\\b", ""],
    _ref2 = _slicedToArray(_ref, 2),
    wordBreak = _ref2[0],
    buffer = _ref2[1];
  var srcbooks = config.raw_regex.books;
  var dstbooks = buffer ? config.raw_regex.books.map(function (i) {
    return [i[1], i[1]];
  }) : [];
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

  //Cleanup
  ref = ref.replace(/\s+/g, " "); //remove double spaces
  ref = ref.replace(/\s*[~–-]\s*/g, "-"); //remove spaces around dashes
  ref = ref.replace(/;(\S+)/g, "; $1"); //add space after semicolons

  var cleanReference = ref.trim();
  cleanReference = handleSingleChapterBookRefs(cleanReference, config);
  if (!cleanReference.match(/:/)) cleanReference = cleanReference.replace(/,/, "; ");
  return cleanReference;
};
var handleSingleChapterBookRefs = function handleSingleChapterBookRefs(ref, config) {
  var singleChapterBooks = Object.keys(config.raw_index).filter(function (book) {
    return loadMaxChapter(book, config) == 1;
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
var splitReferences = function splitReferences(compoundReference, config) {
  var refs = compoundReference.split(/\s*;\s*/);
  var runningBook = "";
  var completeRefs = [];
  for (var i in refs) {
    var ref = refs[i];
    var pieces = ref.split(/([0-9:,-]+)$/);
    var firstPiece = pieces[0].trim();
    runningBook = bookExists(firstPiece, config) ? firstPiece : runningBook;
    var needsPreBook = !bookExists(firstPiece, config);
    var preBook = needsPreBook && runningBook ? runningBook : "";
    completeRefs.push((preBook + " " + ref).trim());
  }
  return completeRefs;
};
var getBook = function getBook(ref, config) {
  var book = ref.replace(/([ 0-9:,-]+)$/, '').trim();
  book = book.replace(/-/g, "—");
  if (bookExists(book, config)) return book;
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
    for (var _i3 = _startChapter; _i3 <= _endChapter; _i3++) {
      _chapterRange.push(_i3);
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
    for (var _i4 in split) {
      // 2:2   OR   1:1-4
      if (split[_i4].match(/:/)) {
        var pieces = split[_i4].split(/:/);
        chapter = mostRecentChapter = pieces[0];
        verses = pieces[1];
      }
      //3   or 6-7
      else {
        chapter = mostRecentChapter;
        verses = split[_i4];
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
    for (var _i5 in _split) {
      //Genesis 1:1-5
      if (_split[_i5].match(/:/)) {
        var _pieces = numbers.split(/:/);
        _chapter = _mostRecentChapter = _pieces[0];
        _verses = _pieces[1];
      }
      //10
      else {
        _chapter = _mostRecentChapter;
        _verses = _split[_i5];
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
    for (var _i6 = _chapters[0]; _i6 <= _chapters[1]; _i6++) {
      var start = 1;
      var end = "X";
      if (_chapters[0] == _i6) start = _verses2[0];
      if (_chapters[1] == _i6) end = _verses2[_verses2.length - 1];
      ranges.push(_i6 + ": " + start + "-" + end);
    }
  } else {
    ranges = [numbers];
  }
  ;
  return ranges;
};
var loadVerseIds = function loadVerseIds(book, ranges, config) {
  var refIndex = loadRefIndex(config);
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
    if (end == "X") end = loadMaxVerse(book, chapter, config);else end = parseInt(end);
    for (var verse_num = start; verse_num <= end; verse_num++) {
      if (refIndex[book] == undefined) continue;
      if (refIndex[book][chapter] == undefined) continue;
      if (refIndex[book][chapter][verse_num] == undefined) continue;
      verseList.push(refIndex[book][chapter][verse_num]);
    }
  }
  return verseList;
};
var loadVerseStructure = function loadVerseStructure(verse_ids, config) {
  var verseIdIndex = loadVerseIdIndex(config);
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
var loadRefsFromRanges = function loadRefsFromRanges(ranges, config) {
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
          if (start_vs == 1 && end_vs == loadMaxVerse(start_bk, start_ch, config))
            //whole chapter
            {
              ref = start_bk + " " + start_ch;
            } else {
            ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_vs;
          }
        }
      } else {
        if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch, config)) {
          ref = start_bk + " " + start_ch + "-" + end_ch;
        } else {
          ref = start_bk + " " + start_ch + ":" + start_vs + "-" + end_ch + ":" + end_vs;
        }
      }
    } else {
      if (start_vs == 1 && end_vs == loadMaxVerse(end_bk, end_ch, config)) {
        ref = start_bk + " " + start_ch + " - " + end_bk + " " + end_ch;
      } else if (end_vs == loadMaxVerse(end_bk, end_ch, config)) {
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

    // Apply language-specific post rules
    if (config.raw_regex.post_rules) {
      var _iterator = _createForOfIteratorHelper(config.raw_regex.post_rules),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var rule = _step.value;
          var re = new RegExp(rule[0], "ig");
          ref = ref.replace(re, rule[1]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    refs.push(ref);
  }
  return refs;
};
var loadRefIndex = function loadRefIndex(config) {
  var refIndex = {};
  var verse_id = 1;
  var book_list = Object.keys(config.raw_index);
  for (var a in book_list) {
    var book_title = book_list[a];
    refIndex[book_title] = {};
    for (var b in config.raw_index[book_title]) {
      var chapter_num = parseInt(b) + 1;
      var verse_max = config.raw_index[book_title][b];
      refIndex[book_title][chapter_num] = {};
      for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
        refIndex[book_title][chapter_num][verse_num] = verse_id;
        verse_id++;
      }
    }
  }
  return refIndex;
};
var loadVerseIdIndex = function loadVerseIdIndex(config) {
  var verseIdIndex = [null];
  var book_list = Object.keys(config.raw_index);
  for (var a in book_list) {
    var book_title = book_list[a];
    for (var b in config.raw_index[book_title]) {
      var chapter_num = parseInt(b) + 1;
      var verse_max = config.raw_index[book_title][b];
      for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
        verseIdIndex.push([book_title, chapter_num, verse_num]);
      }
    }
  }
  return verseIdIndex;
};
var bookExists = function bookExists(book, config) {
  if (config.raw_index[book] === undefined) return false;
  return true;
};
var loadMaxChapter = function loadMaxChapter(book, config) {
  if (!bookExists(book, config)) return 0;
  return config.raw_index[book].length;
};
var loadMaxVerse = function loadMaxVerse(book, chapter, config) {
  if (!bookExists(book, config)) return 0;
  return config.raw_index[book][parseInt(chapter) - 1];
};
var detectReferences = function detectReferences(content, callBack) {
  var language = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  callBack = callBack ? callBack : function (i) {
    return "[".concat(i, "]");
  };
  var effectiveLanguage = getEffectiveLanguage(language);
  var config = getLanguageConfig(effectiveLanguage);
  var src = config.raw_regex.books.map(function (i) {
    return i[0];
  });
  var dst = _toConsumableArray(new Set(config.raw_regex.books.map(function (i) {
    return i[1];
  })));
  var books = [].concat(_toConsumableArray(dst), _toConsumableArray(src));
  return (0, _scriptdetect.processReferenceDetection)(content, books, config.lang_extra, function (query) {
    return lookupReference(query, effectiveLanguage);
  }, callBack);
};
var getLanguageConfig = function getLanguageConfig(language) {
  // Default to English if no language specified or not found
  var effectiveLanguage = language && _scriptlang[language] ? language : 'en';
  var config = {
    language: effectiveLanguage,
    raw_index: _scriptdata,
    raw_regex: _objectSpread({}, _scriptregex),
    lang_extra: {},
    wordBreak: "\\b"
  };

  // For English or if language not found, use defaults
  if (effectiveLanguage === 'en' || !_scriptlang[effectiveLanguage]) {
    return config;
  }

  // Process language-specific data
  var langData = _scriptlang[effectiveLanguage];
  if (langData.books) {
    config.raw_regex.books = [];
    var new_index = {};
    var bookList = Object.keys(langData.books);
    var _loop = function _loop() {
      var _Object$keys;
      var book = _bookList[_i7];
      var book_index = bookList.indexOf(book);
      var original_bookname = (_Object$keys = Object.keys(_scriptdata)) === null || _Object$keys === void 0 ? void 0 : _Object$keys[book_index];
      if (original_bookname) {
        new_index[book] = _scriptdata[original_bookname];
      }
      var matches = [book].concat(_toConsumableArray(langData.books[book]));
      config.raw_regex.books = config.raw_regex.books.concat(matches.map(function (i) {
        return [i, book];
      }));
    };
    for (var _i7 = 0, _bookList = bookList; _i7 < _bookList.length; _i7++) {
      _loop();
    }
    config.raw_index = new_index;
  }
  config.raw_regex.pre_rules = langData.pre_rules || config.raw_regex.pre_rules;
  config.raw_regex.post_rules = langData.post_rules || config.raw_regex.post_rules;
  config.raw_regex.spacing = langData.spacing || ["\\b", ""];
  config.lang_extra = langData.matchRules || {};
  config.wordBreak = langData.wordBreak || "\\b";
  return config;
};

// ES Module exports
export {
  detectReferences as detect,
  detectReferences,
  detectReferences as detectRefs,
  detectReferences as detectScriptureReferences,
  detectReferences as detectScriptures,
  detectReferences as linkRefs,
  generateReference as generate,
  generateReference as gen,
  generateReference,
  setLanguage as lang,
  setLanguage as language,
  setLanguage as setLang,
  setLanguage,
  lookupReference as lookup,
  lookupReference,
  lookupReference as parse,
  lookupReference as read,
  generateReference as ref,
  lookupReference as ref2VerseId,
  generateReference as verseId2Ref
};
