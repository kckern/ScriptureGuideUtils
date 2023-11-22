module.exports  = {
    kr:{
        books:{ "창세기": ["창"], "출애굽기": ["출", "탈출기"], "레위기": ["레"], "민수기": ["민"], "신명기": ["신"], "여호수아": ["수"], "사사기": ["삿", "판관기"], "룻기": ["룻"], "사무엘상": ["삼상"], "사무엘하": ["삼하"], "열왕기상": ["왕상"], "열왕기하": ["왕하"], "역대상": ["대상", "역대기 상"], "역대하": ["대하", "역대기 하"], "에스라": ["스", "에즈라"], "느헤미야": ["느"], "에스더": ["에", "에스텔"], "욥기": ["욥"], "시편": ["시"], "잠언": ["잠"], "전도서": ["전", "코헬렛"], "아가": ["아"], "이사야": ["사", "이사야서"], "예레미야": ["렘", "예레미야서"], "예레미야애가": ["애"], "에스겔": ["겔", "에제키엘"], "다니엘": ["단", "다니엘서"], "호세아": ["호", "호세아서"], "요엘": ["욜", "요엘서"], "아모스": ["암", "아모스서"], "오바댜": ["옵", "오바댜서", "오바디야"], "요나": ["욘", "요나서"], "미가": ["미", "미가서"], "나훔": ["나", "나훔서"], "하박국": ["합", "하박국서", "하바꾹"], "스바냐": ["습", "스바니야"], "학개": ["학", "하깨"], "스가랴": ["슥", "즈가리야"], "말라기": ["말", "말라기서"], "마태복음": ["마", "마태", "마태오 복음서", "마태오의 복음서"], "마가복음": ["막", "마르코 복음서"], "누가복음": ["눅", "루카 복음서", "누가"], "요한복음": ["요", "요한", "요한 *복음서*"], "사도행전": ["행", "사도"], "로마서": ["롬", "로마인들에게 보낸 편지"], "고린도전서": ["고전", "코린토1서"], "고린도후서": ["고후", "코린토2서"], "갈라디아서": ["갈"], "에베소서": ["엡", "에페소인들에게 보낸 편지"], "빌립보서": ["빌", "필리피서"], "골로새서": ["골", "콜로새서"], "데살로니가전서": ["살전", "테살로니카1서"], "데살로니가후서": ["살후", "테살로니카2서"], "디모데전서": ["딤전", "티모테오1서"], "디모데후서": ["딤후", "티모테오2서", "티모테후서"], "디도서": ["딛", "티토서"], "빌레몬서": ["몬", "필레몬서"], "히브리서": ["히"], "야고보서": ["약"], "베드로전서": ["벧전", "베드로1서"], "베드로후서": ["벧후", "베드로2서"], "요한일서": ["요1", "요(일|1)"], "요한이서": ["요2", "요(이|2)"], "요한삼서": ["요3", "요(삼|3)"], "유다서": ["유", "유다의 편지"], "요한 계시록": ["계", "요한 묵시록"], "니파이전서": ["니전"], "니파이후서": ["니후"], "야곱서": ["야곱"], "이노스서": ["이노", "이노스서"], "예이롬서": ["예이", "예이롬"], "옴나이서": ["옴", "옴나이"], "몰몬의 말씀": ["몰말", "몰몬말씀"], "모사이야서": ["모사", "모사이야"], "앨마서": ["앨", "앨마"], "힐라맨서": ["힐", "힐라맨"], "제3니파이": ["3니", "제3니파이서*"], "제4니파이": ["4니", "제4니파이서*"], "몰몬서": ["몰", "몰몬"], "이더서": ["이더"], "모로나이서": ["모로", "모로나이"], "교리와 성약": ["교성", "교리성약"], "모세서": ["모세"], "아브라함서": ["아브", "아브라함"], "조셉 스미스—마태복음": ["조마", "조셉 스미스—마태"], "조셉 스미스—역사": ["조역", "조셉 스미스—역사"], "신앙개조": ["신개"] },
        pre_rules: [
            ["(\\d+)장\\s*(\\d+)(?:~|-)(\\d+)절*", "$1:$2-$3"],
            ["~", "-"],
            ["(\\d+)장", "$1"],
            ["(\\d+)절", "$1"],
            ["([\\u3131-\\uD79D]) *(\\d+)", "$1 $2"],
            ["제 (\\d)", "제$1"],
            ["조셉 스미스[—-]", "조셉 스미스—"],
            [", *([^0-9])", ";  $1"]
        ],
        post_rules: [
            ["([\\u3131-\\uD79D]) *([0-9]+)", "$1 $2장 "],
            ["([0-9]+):([0-9]+)-([0-9]+)", "$1장 $2~$3절"],
            ["[–-]+", "~"],
            ["\\s*:\\s*([0-9~]+)", ":$1절"],
            ["([0-9]+):([0-9]+)", "$1장$2"],
            ["장:([0-9]+)", "장 $1"],
            [";", "; "],
            ["\\s+", " "],
            ["제\\s*([3-4])장\\s*니파이", "제$1니파이"],
            ["([0-9]+)장\\s*([0-9]+)", "$1장 $2"]
        ],
        matchRules:{
            chapter:"장[절0-9~ -–]*",
            verse:"절",
        },
    },
    de:{
        books:
        {
            "Genesis": ["gen","1\\.* *(buch )*mose"],  "Exodus":["ex","2\\.* *(buch )*mose"], "Leviticus":["lev","3\\.* *(buch )*mose"], "Numbers":["num","4\\.* *(buch )*mose"], "Deuteronomy":["dtn","5\\.* *(buch )*mose"], "Josua":["jos"], "Richter":["ri"], "Rut":["rut"], "1 Samuel":["1 sam"], "2 Samuel":["2 sam"], "1 Könige":["1 kön"], "2 Könige":["2 kön"], "1 Chronik":["1 chr"], "2 Chronik":["2 chr"], "Esra":["esra"], "Nehemia":["neh"], "Ester":["est"], "Ijob":["iob"], "Psalmen":["ps"], "Sprichwörter":["spr"], "Kohelet":["koh"], "Hohelied":["hld"], "Jesaja":["jes"], "Jeremia":["jer"], "Klagelieder":["klgl"], "Ezechiel":["ez"], "Daniel":["dan"], "Hosea":["hos"], "Joël":["joe"], "Amos":["am"], "Obadja":["obd"], "Jona":["jon"], "Micha":["mi"], "Nahum":["nah"], "Habakuk":["hab"], "Zefanja":["zef"], "Haggai":["hag"], "Sacharja":["sach"], "Maleachi":["mal"], "Matthäus":["mt"], "Markus": ["mk"], "Lukas": ["lk"], "Johannes": ["joh"], "Apostelgeschichte": ["apg"], "Römer": ["röm"], "1 Korinther": ["1 kor"], "2 Korinther": ["2 kor"], "Galater": ["gal"], "Epheser": ["eph"], "Philipper": ["phil"], "Kolosser": ["kol"], "1 Thessalonicher": ["1 thess"], "2 Thessalonicher": ["2 thess"], "1 Timotheus": ["1 tim"], "2 Timotheus": ["2 tim"], "Titus": ["tit"], "Philemon": ["phlm"], "Hebräer": ["hebr"], "Jakobus": ["jakbr"], "1 Petrus": ["1 petr"], "2 Petrus": ["2 petr"], "1 Johannes": ["1 joh"], "2 Johannes": ["2 joh"], "3 Johannes": ["3 joh"], "Judas": ["jud"], "Offenbarung": ["offb"], "1 Nephi": ["1 ne"], "2 Nephi": ["2 ne"], "Jakob": ["jak"], "Enos": ["enos"], "Jarom": ["jar"], "Omni": ["om"], "Worte Mormons": ["wmorm"], "Mosia": ["mos"], "Alma": ["al"], "Helaman": ["hel"], "3 Nephi": ["3 ne"], "4 Nephi": ["4 ne"], "Mormon": ["morm"], "Ether": ["eth"], "Moroni": ["moro"], "Lehre und Bündnisse": ["lub"], "Mose": ["mose"], "Abraham": ["abr"], "Joseph Smith—Matthäus": ["jsmt"], "Joseph Smith—Lebensgeschichte": ["jslg"], "Glaubensartikel": ["ga"]
        }
    },
    swe:{
        books:{
            "1 Moseboken": ["1 mos"], "2 Moseboken": ["2 mos"], "3 Moseboken": ["3 mos"], "4 Moseboken": ["4 mos"], "5 Moseboken": ["5 mos"], "Josua": ["jos"], "Domarboken": ["dom"], "Rut": ["rut"], "1 Samuelsboken": ["1 sam"], "2 Samuelsboken": ["2 sam"], "1 Kungaboken": ["1 kung"], "2 Kungaboken": ["2 kung"], "1 Krönikeboken": ["1 krön"], "2 Krönikeboken": ["2 krön"], "Esra": ["esra"], "Nehemja": ["neh"], "Ester": ["est"], "Job": ["job"], "Psaltaren": ["ps"], "Ordspråksboken": ["ords"], "Predikaren": ["pred"], "Höga Visan": ["höga v"], "Jesaja": ["jes"], "Jeremia": ["jer"], "Klagovisorna": ["klag"], "Hesekiel": ["hes"], "Daniel": ["dan"], "Hosea": ["hos"], "Joel": ["joel"], "Amos": ["amos"], "Obadja": ["ob"], "Jona": ["jona"], "Mika": ["mika"], "Nahum": ["nah"], "Habackuk": ["hab"], "Sefanja": ["sef"], "Haggai": ["hagg"], "Sakarja": ["sak"], "Malaki": ["mal"], "Matteus": ["matt"], "Markus": ["mark"], "Lukas": ["luk"], "Johannes": ["joh"], "Apostlagärningarna": ["apg"], "Romarbrevet": ["rom"], "1 Korintierbrevet": ["1 kor"], "2 Korintierbrevet": ["2 kor"], "Galaterbrevet": ["gal"], "Efesierbrevet": ["ef"], "Filipperbrevet": ["fil"], "Kolosserbrevet": ["kol"], "1 Tessalonikerbrevet": ["1 tess"], "2 Tessalonikerbrevet": ["2 tess"], "1 Timoteusbrevet": ["1 tim"], "2 Timoteusbrevet": ["2 tim"], "Titus": ["tit"], "Filemon": ["filem"], "Hebreerbrevet": ["hebr"], "Jakobs brev": ["jak"], "1 Petrusbrevet": ["1 petr"], "2 Petrusbrevet": ["2 petr"], "1 Johannesbrevet": ["1 joh"], "2 Johannesbrevet": ["2 joh"], "3 Johannesbrevet": ["3 joh"], "Judas": ["jud"], "Uppenbarelseboken": ["upp"], "1 Nephi": ["1 ne"], "2 Nephi": ["2 ne"], "Jakob": ["jak"], "Enos": ["enos"], "Jarom": ["jar"], "Omni": ["om"], "Mormons ord": ["morm ord"], "Mosiah": ["mos"], "Alma": ["al"], "Helaman": ["hel"], "3 Nephi": ["3 ne"], "4 Nephi": ["4 ne"], "Mormon": ["morm"], "Ether": ["eth"], "Moroni": ["moro"], "Läran och förbunden": ["l&f"],  "Mose": ["mose"], "Abraham": ["abr"], "Joseph Smith – Matteus": ["js-m"], "Joseph Smith – Historien": ["js-h"], "Trosartiklarna": ["ta"]
        }
    },
    ru:{
        books:{
            "Бытие": ["Быт."], "Исход": ["Исх."], "Левит": ["Лев."], "Числа": ["Числ."], "Второзаконие": ["Втор."], "Иисус Навин": ["Нав."], "Книга Судей": ["Суд."], "Руфь": ["Руфь"], "1-я Царств": ["1 Цар."], "2-я Царств": ["2 Цар."], "3-я Царств": ["3 Цар."], "4-я Царств": ["4 Цар."], "1-я Паралипоменон": ["1 Пар."], "2-я Паралипоменон": ["2 Пар."], "Ездра": ["Езд."], "Неемия": ["Неем."], "Есфирь": ["Есф."], "Иов": ["Иов"], "Псалтирь": ["Пс."], "Притчи": ["Притч."], "Екклесиаст": ["Еккл."], "Песня Песней": ["Песн."], "Исаия": ["Ис."], "Иеремия": ["Иер."], "Плач Иеремии": ["Плач"], "Иезекииль": ["Иез."], "Даниил": ["Дан."], "Осия": ["Ос."], "Иоиль": ["Иоиль"], "Амос": ["Ам."], "Авдий": ["Авд."], "Иона": ["Иона"], "Михей": ["Мих."], "Наум": ["Наум"], "Аввакум": ["Авв."], "Софония": ["Соф."], "Аггей": ["Агг."], "Захария": ["Зах."], "Малахия": ["Мал."], "От Матфея": ["Мф."], "От Марка": ["Мк."], "От Луки": ["Лк."], "От Иоанна": ["Ин."], "Деяния": ["Деян."], "К Римлянам": ["Рим."], "1-е к Коринфянам": ["1 Кор."], "2-е к Коринфянам": ["2 Кор."], "К Галатам": ["Гал."], "К Ефесянам": ["Еф."], "К Филиппийцам": ["Флп."], "К Колоссянам": ["Кол."], "1-е к Фессалоникийцам": ["1 Фес."], "2-е к Фессалоникийцам": ["2 Фес."], "1-е к Тимофею": ["1 Тим."], "2-е к Тимофею": ["2 Тим."], "К Титу": ["Тит"], "К Филимону": ["Флм."], "К Евреям": ["Евр."], "Иакова": ["Иакова"], "1-е Петра": ["1 Пет."], "2-е Петра": ["2 Пет."], "1-е Иоанна": ["1 Ин."], "2-е Иоанна": ["2 Ин."], "3-е Иоанна": ["3 Ин."], "Иуды": ["Иуд."], "Откровение": ["Откр."], "1 Нефий": ["1 Неф."], "2 Нефий": ["2 Неф."], "Енос": ["Енос"], "Иаром": ["Иаром"], "Омний": ["Омний"], "Слова Мормона": ["Сл. М."], "Мосия": ["Мосия"], "Алма": ["Алма"], "Геламан": ["Гел."], "3 Нефий": ["3 Неф."], "4 Нефий": ["4 Неф."], "Мормон": ["Морм."], "Ефер": ["Ефер"], "Мороний": ["Морон."], "Учение и Заветы": ["У. и З."], "Моисей": ["Моис."], "Авраам": ["Авр."], "Джозеф Смит – от Матфея": ["ДжС–Мф."], "Джозеф Смит – История": ["ДжС–Ист."], "Символы веры": ["С. В."]
        }
    },
    vn:{
        books:{
            "Sáng Thế Ký": ["STKý", "Sáng Thế"], "Xuất Ê Díp Tô Ký": ["XÊDTKý", "Xuất Ê Díp Tô"], "Lê Vi Ký": ["LVKý", "Lê Vi"], "Dân Số Ký": ["DSKý", "Dân Số"], "Phục Truyền Luật Lệ Ký": ["PTLLKý", "Phục Truyền Luật Lệ"], "Giô Suê": ["GiôSuê"], "Các Quan Xét": ["QXét"], "Ru Tơ": ["RuTơ"], "1 Sa Mu Ên": ["1 SMÊn", "1 Sa Mu Ên"], "2 Sa Mu Ên": ["2 SMÊn", "2 Sa Mu Ên"], "1 Các Vua": ["1 Vua"], "2 Các Vua": ["2 Vua"], "1 Sử Ký": ["1 SửKý"], "2 Sử Ký": ["2 SửKý"], "E Xơ Ra": ["EXơRa"], "Nê Hê Mi": ["NêHêMi"], "Ê Xơ Tê": ["ÊXơTê"], "Gióp": ["Gióp"], "Thi Thiên": ["TThiên"], "Châm Ngôn": ["CNgôn"], "Truyền Đạo": ["TĐạo"], "Nhã Ca": ["NhãCa"], "Ê Sai": ["ÊSai"], "Giê Rê Mi": ["GRMi"], "Ca Thương": ["CThương"], "Ê Xê Chi Ên": ["ÊXCÊn"], "Đa Ni Ên": ["ĐNÊn"], "Ô Sê": ["ÔSê"], "Giô Ên": ["GiôÊn"], "A Mốt": ["AMốt"], "Áp Đia": ["ÁpĐia"], "Giô Na": ["GiôNa"], "Mi Chê": ["MiChê"], "Na Hum": ["NaHum"], "Ha Ba Cúc": ["HBCuc"], "Sô Phô Ni": ["SPNi"], "A Ghê": ["AGhê"], "Xa Cha Ri": ["XCRi"], "Ma La Chi": ["MLChi"], "Ma Thi Ơ": ["MTƠ"], "Mác": ["Mác"], "Lu Ca": ["LuCa"], "Giăng": ["Giăng"], "Công Vụ Các Sứ Đồ": ["CVCSĐ"], "Rô Ma": ["RôMa"], "1 Cô Rinh Tô": ["1 CRTô"], "2 Cô Rinh Tô": ["2 CRTô"], "Ga La Ti": ["GLTi"], "Ê Phê Sô": ["ÊPSô"], "Phi Líp": ["PhiLíp"], "Cô Lô Se": ["CLSe"], "1 Tê Sa Lô Ni Ca": ["1 TSLNCa"], "2 Tê Sa Lô Ni Ca": ["2 TSLNCa"], "1 Ti Mô Thê": ["1 TMThê"], "2 Ti Mô Thê": ["2 TMThê"], "Tít": ["Tít"], "Phi Lê Môn": ["PLMôn"], "Hê Bơ Rơ": ["HBRơ"], "Gia Cơ": ["GiaCơ"], "1 Phi E Rơ": ["1 PERơ"], "2 Phi E Rơ": ["2 PERơ"], "1 Giăng": ["1 Giăng"], "2 Giăng": ["2 Giăng"], "3 Giăng": ["3 Giăng"], "Giu Đe": ["GiuĐe"], "Khải Huyền": ["KHuyền"], "1 Nê Phi": ["1 NêPhi"], "2 Nê Phi": ["2 NêPhi"], "Gia Cốp": ["GCốp"], "Ê Nót": ["ÊNót"], "Gia Rôm": ["GRôm"], "Ôm Ni": ["ÔmNi"], "Lời Mặc Môn": ["LMMôn"], "Mô Si A": ["MôSiA"], "An Ma": ["AnMa"], "Hê La Man": ["HLMan"], "3 Nê Phi": ["3 NêPhi"], "4 Nê Phi": ["4 NêPhi"], "Mặc Môn": ["MMôn"], "Ê The": ["ÊThe"], "Mô Rô Ni": ["MRNi"], "Giáo Lý và Giao Ước": ["GLGƯ"], "Tuyên Ngôn Chính Thức": ["TNCT"], "Môi Se": ["MôiSe"], "Áp Ra Ham": ["ARHam"], "Joseph Smith—Ma Thi Ơ": ["JS—MTƠ"], "Joseph Smith—Lịch Sử": ["JS—LS"], "Những Tín Điều": ["NTĐ"]
        }
    },
    fr:{
        books:{
            "Genèse": ["Ge"], "Exode": ["Ex"], "Lévitique": ["Lé"], "Nombres": ["No"], "Deutéronome": ["De"], "Josué": ["Jos"], "Juges": ["Jg"], "Ruth": ["Ru"], "1 Samuel": ["1 S"], "2 Samuel": ["2 S"], "1 Rois": ["1 R"], "2 Rois": ["2 R"], "1 Chroniques": ["1 Ch"], "2 Chroniques": ["2 Ch"], "Esdras": ["Esd"], "Néhémie": ["Né"], "Esther": ["Est"], "Job": ["Job"], "Psaumes": ["Ps"], "Proverbes": ["Pr"], "Ecclésiaste": ["Ec"], "Cantique des Cantiques": ["Ca"], "Ésaïe": ["És"], "Jérémie": ["Jé"], "Lamentations": ["La"], "Ézéchiel": ["Éz"], "Daniel": ["Da"], "Osée": ["Os"], "Joël": ["Joë"], "Amos": ["Am"], "Abdias": ["Ab"], "Jonas": ["Jon"], "Michée": ["Mi"], "Nahum": ["Na"], "Habacuc": ["Ha"], "Sophonie": ["So"], "Aggée": ["Ag"], "Zacharie": ["Za"], "Malachie": ["Mal"], "Matthieu": ["Mt"], "Marc": ["Mc"], "Luc": ["Lu"], "Jean": ["Jn"], "Actes": ["Ac"], "Romains": ["Ro"], "1 Corinthiens": ["1 Co"], "2 Corinthiens": ["2 Co"], "Galates": ["Ga"], "Éphésiens": ["Ép"], "Philippiens": ["Ph"], "Colossiens": ["Col"], "1 Thessaloniciens": ["1 Th"], "2 Thessaloniciens": ["2 Th"], "1 Timothée": ["1 Ti"], "2 Timothée": ["2 Ti"], "Tite": ["Tit"], "Philémon": ["Phm"], "Hébreux": ["Hé"], "Jacques": ["Ja"], "1 Pierre": ["1 Pi"], "2 Pierre": ["2 Pi"], "1 Jean": ["1 Jn"], "2 Jean": ["2 Jn"], "3 Jean": ["3 Jn"], "Jude": ["Jud"], "Apocalypse": ["Ap"], "1 Néphi": ["1 Né"], "2 Néphi": ["2 Né"], "Jacob": ["Jcb"], "Énos": ["Én"], "Jarom": ["Jm"], "Omni": ["Om"], "Paroles de Mormon": ["Pa"], "Mosiah": ["Mos"], "Alma": ["Al"], "Hélaman": ["Hél"], "3 Néphi": ["3 Né"], "4 Néphi": ["4 Né"], "Mormon": ["Mrm"], "Éther": ["Ét"], "Moroni": ["Mro"], "Doctrine et Alliances": ["D&A"], "Moïse": ["Moï"], "Abraham": ["Abr"], "Joseph Smith, Matthieu": ["JS, M"], "Joseph Smith, Histoire": ["JS, H"], "Articles de foi": ["AF"]
        }
    },

    tgl:{
        books:{"Genesis": ["Gen."], "Exodo": ["Ex."], "Levitico": ["Lev."], "Mga Bilang": ["Blg."], "Deuteronomio": ["Deut."], "Josue": ["Jos."], "Mga Hukom": ["Huk."], "Ruth": ["Ruth"], "1 Samuel": ["1 Sam."], "2 Samuel": ["2 Sam."], "1 Mga Hari": ["1 Hari"], "2 Mga Hari": ["2 Hari"], "1 Mga Cronica": ["1 Cron."], "2 Mga Cronica": ["2 Cron."], "Ezra": ["Ezra"], "Nehemias": ["Neh."], "Esther": ["Est."], "Job": ["Job"], "Mga Awit": ["Awit"], "Mga Kawikaan": ["Kaw."], "Eclesiastes": ["Ec."], "Awit ni Solomon": ["A ni S"], "Isaias": ["Is."], "Jeremias": ["Jer."], "Mga Panaghoy": ["Panag."], "Ezekiel": ["Ez."], "Daniel": ["Dan."], "Oseas": ["Os."], "Joel": ["Joel"], "Amos": ["Amos"], "Obadias": ["Obad."], "Jonas": ["Jon."], "Mikas": ["Mi."], "Nahum": ["Nah."], "Habacuc": ["Hab."], "Zefanias": ["Zef."], "Hagai": ["Hag."], "Zacarias": ["Zac."], "Malakias": ["Mal."], "Mateo": ["Mat."], "Marcos": ["Mar."], "Lucas": ["Lu."], "Juan": ["Juan"], "Mga Gawa": ["Gawa"], "Mga Taga-Roma": ["Rom."], "1 Mga Taga-Corinto": ["1 Cor."], "2 Mga Taga-Corinto": ["2 Cor."], "Mga Taga-Galacia": ["Gal."], "Mga Taga-Efeso": ["Ef."], "Mga Taga-Filipos": ["Fil."], "Mga Taga-Colosas": ["Col."], "1 Mga Taga-Tesalonica": ["1 Tes."], "2 Mga Taga-Tesalonica": ["2 Tes."], "1 Kay Timoteo": ["1 Tim."], "2 Kay Timoteo": ["2 Tim."], "Kay Tito": ["Tit."], "Kay Filemon": ["Flm."], "Sa mga Hebreo": ["Heb."], "Santiago": ["Sant."], "1 Pedro": ["1 Ped."], "2 Pedro": ["2 Ped."], "1 Juan": ["1 Juan"], "2 Juan": ["2 Juan"], "3 Juan": ["3 Juan"], "Judas": ["Jud."], "Apocalipsis": ["Apoc."], "1 Nephi": ["1 Ne."], "2 Nephi": ["2 Ne."], "Jacob": ["Jac."], "Enos": ["Enos"], "Jarom": ["Jar."], "Omni": ["Omni"], "Mga Salita ni Mormon": ["S ni M"], "Mosias": ["Mos."], "Alma": ["Alma"], "Helaman": ["Hel."], "3 Nephi": ["3 Ne."], "4 Nephi": ["4 Ne."], "Mormon": ["Morm."], "Eter": ["Eter"], "Moroni": ["Moro."], "Doktrina at mga Tipan": ["D at T"], "Moises": ["Moi."], "Abraham": ["Abr."], "Joseph Smith—Mateo": ["JS—M"], "Joseph Smith—Kasaysayan": ["JS—K"], "Ang mga Saligan ng Pananampalataya": ["S ng P"]}
    },
    jp:{
        books:{
            "創世記": ["創世", "創世記"], "出エジプト記": ["出エ", "出エジプト記"], "レビ記": ["レビ", "レビ記"], "民数記": ["民数", "民数記"], "申命記": ["申命", "申命記"], "ヨシュア記": ["ヨシ", "ヨシュア記"], "士師記": ["士師", "士師記"], "ルツ記": ["ルツ", "ルツ記"], "サムエル記上": ["サ上", "サムエル記上"], "サムエル記下": ["サ下", "サムエル記下"], "列王紀上": ["列上", "列王紀上"], "列王紀下": ["列下", "列王紀下"], "歴代志上": ["歴上", "歴代志上"], "歴代志下": ["歴下", "歴代志下"], "エズラ記": ["エズ", "エズラ記"], "ネヘミヤ記": ["ネヘ", "ネヘミヤ記"], "エステル記": ["エス", "エステル記"], "ヨブ記": ["ヨブ", "ヨブ記"], "詩篇": ["詩篇"], "箴言": ["箴言"], "伝道の書": ["伝道", "伝道の書"], "雅歌": ["雅歌"], "イザヤ書": ["イザ", "イザヤ書"], "エレミヤ書": ["エレ", "エレミヤ書"], "哀歌": ["哀歌"], "エゼキエル書": ["エゼ", "エゼキエル書"], "ダニエル書": ["ダニ", "ダニエル書"], "ホセア書": ["ホセ", "ホセア書"], "ヨエル書": ["ヨエ", "ヨエル書"], "アモス書": ["アモ", "アモス書"], "オバデヤ書": ["オバ", "オバデヤ書"], "ヨナ書": ["ヨナ", "ヨナ書"], "ミカ書": ["ミカ", "ミカ書"], "ナホム書": ["ナホ", "ナホム書"], "ハバクク書": ["ハバ", "ハバクク書"], "ゼパニヤ書": ["ゼパ", "ゼパニヤ書"], "ハガイ書": ["ハガ", "ハガイ書"], "ゼカリヤ書": ["ゼカ", "ゼカリヤ書"], "マラキ書": ["マラ", "マラキ書"], "マタイによる福音書": ["マタ", "マタイによる福音書"], "マルコによる福音書": ["マコ", "マルコによる福音書"], "ルカによる福音書": ["ルカ", "ルカによる福音書"], "ヨハネによる福音書": ["ヨハ", "ヨハネによる福音書"], "使徒行伝": ["使徒", "使徒行伝"], "ローマ人への手紙": ["ロマ", "ローマ人への手紙"], "コリント人への第一の手紙": ["1コリ", "コリント人への第一の手紙"], "コリント人への第二の手紙": ["2コリ", "コリント人への第二の手紙"], "ガラテヤ人への手紙": ["ガラ", "ガラテヤ人への手紙"], "エペソ人への手紙": ["エペ", "エペソ人への手紙"], "ピリピ人への手紙": ["ピリ", "ピリピ人への手紙"], "コロサイ人への手紙": ["コロ", "コロサイ人への手紙"], "テサロニケ人への第一の手紙": ["1テサ", "テサロニケ人への第一の手紙"], "テサロニケ人への第二の手紙": ["2テサ", "テサロニケ人への第二の手紙"], "テモテへの第一の手紙": ["1テモ", "テモテへの第一の手紙"], "テモテへの第二の手紙": ["2テモ", "テモテへの第二の手紙"], "テトスへの手紙": ["テト", "テトスへの手紙"], "ピレモンへの手紙": ["ピレ", "ピレモンへの手紙"], "ヘブル人への手紙": ["ヘブ", "ヘブル人への手紙"], "ヤコブの手紙": ["新ヤコ", "ヤコブの手紙"], "ペテロの第一の手紙": ["1ペテ", "ペテロの第一の手紙"], "ペテロの第二の手紙": ["2ペテ", "ペテロの第二の手紙"], "ヨハネの第一の手紙": ["1ヨハ", "ヨハネの第一の手紙"], "ヨハネの第二の手紙": ["2ヨハ", "ヨハネの第二の手紙"], "ヨハネの第三の手紙": ["3ヨハ", "ヨハネの第三の手紙"], "ユダの手紙": ["ユダ", "ユダの手紙"], "ヨハネの黙示録": ["黙示", "ヨハネの黙示録"], "ニーファイ第一書": ["1ニフ", "ニーファイ第一書"], "ニーファイ第二書": ["2ニフ", "ニーファイ第二書"], "ヤコブ書": ["ヤコ", "ヤコブ書"], "エノス書": ["エノ", "エノス書"], "ジェロム書": ["ジェロ", "ジェロム書"], "オムナイ書": ["オム", "オムナイ書"], "モルモンの言葉": ["モ言", "モルモンの言葉"], "モーサヤ書": ["モサ", "モーサヤ書"], "アルマ書": ["アル", "アルマ書"], "ヒラマン書": ["ヒラ", "ヒラマン書"], "第三ニーファイ": ["3ニフ", "第三ニーファイ"], "第四ニーファイ": ["4ニフ", "第四ニーファイ"], "モルモン書": ["モル", "モルモン書"], "エテル書": ["エテ", "エテル書"], "モロナイ書": ["モロ", "モロナイ書"], "教義と聖約": ["教義", "教義と聖約"], "公式の宣言": ["公式"], "モーセ書": ["モセ", "モーセ書"], "アブラハム書": ["アブ", "アブラハム書"], "ジョセフ・スミス—マタイ": ["ジ—マタ", "ジョセフ・スミス—マタイ"], "ジョセフ・スミス—歴史": ["ジ—歴史", "ジョセフ・スミス—歴史"], "信仰箇条": ["箇条", "信仰箇条"]
        }
    }
}
