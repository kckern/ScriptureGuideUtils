module.exports  = {
    "books":[
        ["gen\\.*(?:esis)*", "Genesis"],
        ["exo*\\.*(?:dus)*", "Exodus"],
        ["levi*t*\\.*(?:icus)*", "Leviticus"],
        ["num\\.*(?:bers)*", "Numbers"],
        ["deut\\.*(?:eronomy)*", "Deuteronomy"],
        ["josh\\.*(?:ua)*", "Joshua"],
        ["judg\\.*(?:es)*", "Judges"],
        ["rut*h*\\.*", "Ruth"],
        ["sam*u*\\.*(?:el)*", "Samuel"],
        ["ki*n*gs*\\.*", "Kings"],
        ["chr*o*n*\\.*(?:icles)*", "Chronicles"],
        ["ezr*\\.*(?:a)*", "Ezra"],
        ["neh\\.*(?:emiah)*", "Nehemiah"],
        ["esth*\\.*(?:er)*", "Esther"],
        ["job", "Job"],
        ["ps\\.*(?:a)*\\.*(?:lm)*\\.*(?:s)*", "Psalms"],
        ["prov\\.*(?:erbs)*", "Proverbs"],
        ["eccl*\\.*(?:esiastes)*", "Ecclesiastes"],
        ["(the )*song*\\.*(?: of solomon)*", "Solomon's Song"],
        ["isa\\.*(?:iah)*", "Isaiah"],
        ["jer\\.*(?:emiah)*", "Jeremiah"],
        ["lame*n*t*\\.*(?:ations)*", "Lamentations"],
        ["eze*k*\\.*(?:iel)*", "Ezekiel"],
        ["dan\\.*(?:iel)*", "Daniel"],
        ["hos*\\.*(?:ea)*", "Hosea"],
        ["joel*\\.*", "Joel"],
        ["amos*\\.*", "Amos"],
        ["obad\\.*(?:iah)*", "Obadiah"],
        ["jon*\\.*(?:ah)*", "Jonah"],
        ["mic*\\.*(?:ah)*", "Micah"],
        ["nah*\\.*(?:um)*", "Nahum"],
        ["hab*\\.*(?:akuk)*", "Habakkuk"],
        ["zeph*\\.*(?:aniah)*", "Zephaniah"],
        ["hag\\.*(?:gai)*", "Haggai"],
        ["zech*\\.*(?:ariah)*", "Zechariah"],
        ["mal*\\.*(?:achi)*", "Malachi"],
        
        ["(?:ma*t*t*h*|mt)\\.*(?:ew)*", "Matthew"],
        ["m(ar)*k", "Mark"],
        ["lu*k*e*\\.*", "Luke"],
        ["jo*h*n\\.*", "John"],
        ["(?:the )*act*s*\\.*(?: of the apostles)*", "Acts"],
        ["rom*\\.*(?:ans)*", "Romans"],
        ["cor\\.*(?:inthians)*", "Corinthians"],
        ["gal*a*\\.*(?:tians)*", "Galatians"],
        ["ephe*\\.*(?:sians)*", "Ephesians"],
        ["phili*p*\\.*(?:ippians)*", "Philippians"],
        ["colo*s*\\.*(?:sians)*", "Colossians"],
        ["thess*\\.*(?:alonians)*", "Thessalonians"],
        ["tim\\.*(?:othy)*", "Timothy"],
        ["tit*\\.*(?:us)*", "Titus"],
        ["philem*o*n*\\.*", "Philemon"],
        ["he\\.*(?:b)*\\.*(?:rews)*", "Hebrews"],
        ["ja\\.*(?:me)*s", "James"],
        ["pet*\\.*(?:er)*", "Peter"],
        ["ju\\.*(?:d)*\\.*(?:e)*", "Jude"],
        ["rev\\.*(?:elation)*", "Revelation"],


        ["1\\s*esd\\.*(?:ras)*", "1 Esdras"],
        ["2\\s*esd\\.*(?:ras)*", "2 Esdras"],
        ["add\\.*to\\.*esth\\.*", "Additions to Esther"],
        ["1\\s*mac\\.*(?:cabees)*", "1 Maccabees"],
        ["2\\s*mac\\.*(?:cabees)*", "2 Maccabees"],
        ["tob\\.*", "Tobit"],
        ["jud\\.*(?:ith)*\\s", "Judith"],
        ["wis\\.*of\\.*sol", "Wisdom of Solomon"],
        ["ecclesiasticus", "Ecclesiasticus"],
        ["sirach", "Ecclesiasticus"],
        ["bar\\.*(?:uch)*", "Baruch"],
        ["ep\\.*of\\.*jer", "Epistle of Jeremiah"],
        ["sus\\.*(?:anna)*", "Susanna"],
        ["bel\\.*", "Bel and the Dragon"],

        
        ["ne\\.*(?:phi)*", "Nephi"],
        ["jac\\.*(?:ob)*", "Jacob"],
        ["en\\.*(?:os)*", "Enos"],
        ["jar\\.*(?:om)*", "Jarom"],
        ["om\\.*(?:ni)*", "Omni"],
        ["(?:the *)*w(?:ords)*[ _-]*o[ _-f]*m(?:ormon)*", "Words of Mormon"],
        ["mos\\.*(?:iah)*", "Mosiah"],
        ["alma", "Alma"],
        ["hela*\\.*(?:a*man)*", "Helaman"],
        ["eth\\.*(?:er)*", "Ether"],
        ["morm\\.*(?:on)*", "Mormon"],
        ["moro\\.*(?:ni)*", "Moroni"],
        
        ["d(?:octrine)*\\.* *(?:&amp;|&|and)* *c(?:ovenants)*(?:\\s*\\bSec(?:tion)*)*\\.*", "Doctrine and Covenants"],
        ["dee and see", "Doctrine and Covenants"], 
        
        ["Moses", "Moses"],
        ["Abra*\\.*(?:ham)*", "Abraham"],
        ["Jos(?:eph)*\\.* Smith(?:[–—\\- ]+Matthew)", "Joseph Smith\u2014Matthew"],
        ["Jos(?:eph)*\\.* Smith(?:[–—\\- ]+History)", "Joseph Smith\u2014History"],
        ["JS[—\\-]*\\s*[H]", "Joseph Smith History"],
        ["JS[—\\-]*\\s*[M]", "Joseph Smith Matthew"],
        ["a(?:rticles)*[ _-]*o[ _-f]*f(?:aith)*", "Articles of Faith"],
        
        [",* *jst", "JST"], 
        ["Jos(eph)*\\.* Smith('s)* Translation,*( of)*\\s*", "JST"], 
        ["([^;-]*?)\\s*jst\\s*", "JST $1"], 
        ["JST *,*[ —-]+", "JST "], 
        ["JST Genesis 0", "Moses 1"],
        ["lect*(?:ures*)*(?: on faith)*\\.*", "Lectures on Faith"],
        ["l[ _-]*o*[ _-n]*f", "Lectures on Faith"],
        ["bo*c\\s*(\\d+)", "Book of Commandments $1"],
        ["(?:book of )*com(?:mandments)*", "Book of Commandments"],
        ["l *on* *f", "Lectures on Faith"],
        ["lec\\.*(?:tures*)(?: on faith)*", "Lectures on Faith"],
        
        ["(?:the )*(?:book of )*(?:the )*Law of the Lord", "Law"],
        ["Law", "The Law of the Lord"],
        
        ["tsp", "The Sealed Portion"],
        ["the sealed portion", "The Sealed Portion"],
        ["1\\s*(?:st)*\\s*v(?:ision)*", "First Vision"],
        
        ["W\\s*Moroni", "Words of Moroni"],
        ["s(?:ealed)*.*?moses", "Sealed Book of Moses"],
        ["3.*ne(phi)*(te)*.*?acts", "Acts of the Three Nephites"],
        
        ["qur['’ ]*(an)*", "Qur’an"],
        ["(?:al[ \\-––])*qur'*’*ani*c*(?:verses*)*", "Qur’an"],
        ["surah [a-z\\-–’']*(?: |:|–|\\-|v|vv|verses*)*", "Qur’an"],
        ["al[ \\-–][a-z\\-–’']+(?: |:|–|\\-|v|vv|verses*|ayab)*", "Qur’an"],
        ["kor(an)*", "Qur’an"],
        
        ["dh*p(ada)*", "Dhammapada"],
        ["d(ha|ah)mm*(apada)*", "Dhammapada"],
        ["b*h*(agavad)* *g(ita)*", "Bhagavad Gita"],
        ["tao( *te* *ching)*", "Tao Te Ching"],
        
        
        ["(Book of )+", "Book of "],
        ["( on Faith)+", " on Faith"],
        ["(Solomon's )+", "Solomon's "]
    ],
    "pre_rules":[

        ["[.]{2,}", ";"],
        ["(\\d+) (\\d+)", "$1.$2"],
        ["[.]", ":"],
        ["([a-z])[ .-]*0+", "$1"],
        ["^(\\d+)-", "$1"],
        [" "," "],

        ["(first|1st|\\bi\\b)", "1"],
        ["(second|2nd|\\bii\\b)", "2"],
        ["(third|3rd|\\biii\\b)", "3"],
        ["(fourth|4th|\\biv\\b)", "4"],
        ["([0-9])th\\b", "$1"],
        ["([1-4])(st|nd|d|rd|th)\\b", "$1"],
        [",*\\s*\\b(?:ch\\b|chap(?:t*er)*s*)\\.*\\,*\\s*(\\d+)", "$1"],
        [",*\\s*\\b(?:sec\\b|section)\\.*\\s*(\\d+)", "$1"],
        ["([0-9]),*\\s*\\b(?:chapt*ers*|ch|chptrs*)\\.*,*\\s*([0-9])", "$1:$2"],
        ["([a-z]),*\\s*\\b(?:chapt*ers*|ch|chptrs*)\\s*([0-9])", "$1 $2"],
        ["[()]+", " "],  
        ["[\\s.]*[–—−\\-]+[\\s.]*", "-"], 
        ["([;,])\\s*and\\s*", "$1"],
        ["([0-9])[ .]*and[ .]*", "$1,"],
        ["(\\d)(\\.|: )(\\d)", "$1:$3"],
        ["\\s+(\\d+)[-–—](\\d+:\\d+)", " $1:1-$2"],
        ["(\\d)([A-Z])", "$1 $2"],
        ["(\\d) ([A-Z])$", "$1$2"],
        ["([0-9]),\\s*([1-4]*\\s*[a-z])", "$1; $2"],
        ["([a-z]), ([0-9])", "$1 $2"],  
        ["\\.", " "],  
        [" - ", " "],  
        ["; ", ";"],  
        [": ", ":"],  
        ["(\\D)-(\\d)", "$1 $2"],  
        ["([a-z]),", "$1"],  
        ["jst(,| of )", "JST "],  
        ["jst([a-z])", "JST $1"],  
        [",\\s*((?:\\d+\\s)*[a-z])", "; $1"],
        ["\\b\\s*cf\\.*\\s*\\b", "; "],
        ["\\bv*ve*r*s*e*s*\\s*([0-9])", ":$1"],
        ["(, *)*\\bverses*\\s*([0-9])", ":$1"],
        ["\\s*:", ":"],  
        [";\\s*:", ":"],
        ["(\\d+) *to *(\\d+)", "$1-$2"], 
        ["([—-])h", "\u2014H"],
        ["([—-])m", "\u2014M"],
        ["([A-za-z])(\\d)", "$1 $2"],
        ["([0-9]),\\s*([1-4]*\\s*[a-z])", "$1; $2"],
        ["o([nf])", "o$1"],
        ["([;,])", "$1 "],
        ["(the )*book of", ""]
    ],

    "post_rules":[
        ["(Words of Mormon|Articles of Faith|4 Nephi|Jarom|Enos|Omni|Obadiah|2 John|3 John|Philemon|Jude|First Vision|Joseph Smith—.+)\\s+([2-9]|(\\d\\d+))","$1 1:$2"],
        ["(^|;\\s*)(Nephi|cor|kings|chron|thes|pet|tim)","$1 1 $2"],
        ["\\s+"," "],
        ["([a-z]\\s*\\d+)(-\\d+:\\d+)","$1:1$2"],
        ["--","\u2014"]
    ]
}