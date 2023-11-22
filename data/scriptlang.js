module.exports  = {
    ko:{
        books:[
            "창세기","출애굽기","레위기","민수기","신명기","여호수아","사사기","룻기","사무엘상","사무엘하","열왕기상","열왕기하","역대상","역대하","에스라","느헤미야","에스더","욥기","시편","잠언","전도서","아가","이사야","예레미야","예레미야애가","에스겔","다니엘","호세아","요엘","아모스","오바댜","요나","미가","나훔","하박국","스바냐","학개","스가랴","말라기",
            "마태복음","마가복음","누가복음","요한복음","사도행전","로마서","고린도전서","고린도후서","갈라디아서","에페소서","빌립보서","골로새서","데살로니가전서","데살로니가후서","디모데전서","디모데후서","디도서","빌레몬서","히브리서","야고보서","베드로전서","베드로후서","요한일서","요한이서","요한삼서","유다서","요한 계시록",
            "니파이전서","니파이후서","야곱서","이노스서","예이롬서","옴나이서","몰몬의 말씀","모사이야서","앨마서","힐라맨서","제3니파이","제4니파이","몰몬서","이더서","모로나이서",
            "교리와 성약","모세서","아브라함서","조셉 스미스—마태복음","조셉 스미스—역사","신앙개조"
        ],
        matchRules:{
            chapter:"장[절0-9~ -–]*",
            verse:"절",
        },
        regex:[
            ["창","창세기"],
            ["탈출기","출애굽기"],
            ["출","출애굽기"],
            ["레","레위기"],
            ["민","민수기"],
            ["신","신명기"],
            ["수","여호수아"],
            ["판관기","사사기"],
            ["삿","사사기"],
            ["룻","룻기"],
            ["삼상","사무엘 상"],
            ["삼하","사무엘 하"],
            ["왕상","열왕기 상"],
            ["왕하","열왕기 하"],
            ["대상","역대상"],
            ["역대기 상","역대상"],
            ["대하","역대하"],
            ["역대기 하","역대하"],
            ["스","에스라"],
            ["에즈라","에스라"],
            ["느","느헤미야"],
            ["에","에스더"],
            ["에스텔","에스더"],
            ["욥","욥기"],
            ["시","시편"],
            ["잠","잠언"],
            ["전","전도서"],
            ["코헬렛","전도서"],
            ["아","아가"],
            ["사","이사야"],
            ["렘","예레미야"],
            ["애","예레미야애가"],
            ["겔","에스겔"],
            ["에제키엘","에스겔"],
            ["단","다니엘"],
            ["호","호세아"],
            ["욜","요엘"],
            ["암","아모스"],
            ["옵","오바댜"],
            ["오바디야","오바댜"],
            ["욘","요나"],
            ["미","미가"],
            ["나","나훔"],
            ["합","하박국"],
            ["하바꾹","하박국"],
            ["습","스바냐"],
            ["스바니야","스바냐"],
            ["학","학개"],
            ["하깨","학개"],
            ["슥","스가랴"],
            ["즈가리야","스가랴"],
            ["말","말라기"],
            ["마","마태복음"],
            ["마태","마태복음"],
            ["마태오 복음서","마태복음"],
            ["마태오의 복음서","마태복음"],
            ["막","마가복음"],
            ["마르코 복음서","마가복음"],
            ["눅","누가복음"],
            ["루카 복음서","누가복음"],
            ["누가","누가복음"],
            ["요","요한복음"],
            ["요한","요한복음"],
            ["요한 *복음서*","요한복음"],
            ["행","사도행전"],
            ["사도","사도행전"],
            ["롬","로마서"],
            ["로마인들에게 보낸 편지","로마서"],
            ["고전","고린도전서"],
            ["코린토1서","고린도전서"],
            ["고후","고린도후서"],
            ["코린토2서","고린도후서"],
            ["갈","갈라디아서"],
            ["엡","에페소서"],
            ["에페소인들에게 보낸 편지","에페소서"],
            ["빌","빌립보서"],
            ["필리피서","빌립보서"],
            ["골","골로새서"],
            ["콜로새서","골로새서"],
            ["살전","데살로니가전서"],
            ["테살로니카1서","데살로니가전서"],
            ["살후","데살로니가후서"],
            ["테살로니카2서","데살로니가후서"],
            ["딤전","디모데전서"],
            ["티모테오1서","디모데전서"],
            ["딤후","디모데후서"],
            ["티모테오2서","디모데후서"],
            ["티모테후서","디모데후서"],
            ["딛","디도서"],
            ["티토서","디도서"],
            ["몬","빌레몬서"],
            ["필레몬서","빌레몬서"],
            ["히","히브리서"],
            ["약","야고보서"],
            ["벧전","베드로전서"],
            ["베드로1서","베드로전서"],
            ["벧후","베드로후서"],
            ["베드로2서","베드로후서"],
            ["요(일|1)","요한일서"],
            ["요(이|2)","요한이서"],
            ["요(삼|3)","요한삼서"],
            ["유","유다서"],
            ["유다의 편지","유다서"],
            ["계","요한 계시록"],
            ["요한 묵시록","요한 계시록"],

            ["니전","니파이전서"],
            ["니후","니파이후서"],
            ["야곱","야곱서"],
            ["이노","이노스서"],
            ["이노스서","이노스서"],
            ["예이","예이롬서"],
            ["예이롬","예이롬서"],
            ["옴","옴나이서"],
            ["옴나이","옴나이서"],
            ["몰말","몰몬의 말씀"],
            ["몰몬말씀","몰몬의 말씀"],
            ["모사","모사이야서"],
            ["모사이야","모사이야서"],
            ["앨","앨마서"],
            ["앨마","앨마서"],
            ["힐","힐라맨서"],
            ["힐라맨","힐라맨서"],
            ["3니","제3니파이"],
            ["제3니파이서*","제3니파이"],
            ["4니","제4니파이"],
            ["제4니파이서*","제4니파이"],
            ["몰","몰몬서"],
            ["몰몬","몰몬서"],
            ["이더","이더서"],
            ["모로","모로나이서"],
            ["모로나이","모로나이서"],
            ["교성","교리와 성약"],
            ["교리성약","교리와 성약"],
            ["모세","모세서"],
            ["아브","아브라함서"],
            ["아브라함","아브라함서"],
            ["조셉 스미스—마태","조셉 스미스—마태복음"],
            ["조셉 스미스—역사","조셉 스미스—역사"],
            ["신앙개조","신앙개조"]

            ],
            postProcess:(i)=>{
                i = i.replace(/([\u3131-\uD79D]) *([0-9]+)/ig, "$1 $2장 ");
                i = i.replace(/([0-9]+):([0-9]+)-([0-9]+)/g, "$1장 $2~$3절");
                i = i.replace(/[–-]+/g,"~");
                i = i.replace(/\s*:\s*([0-9~]+)/g, ":$1절");
                i = i.replace(/([0-9]+):([0-9]+)/g, "$1장$2");
                i = i.replace(/장:([0-9]+)/g, "장 $1");

                i = i.replace(/;/g, "; ").replace(/\s+/g, " ").trim();
                i = i.replace(/제\s*([3-4])장\s*니파이/g, "제$1니파이");
                i = i.replace(/([0-9]+)장\s*([0-9]+)/g, "$1장 $2");
                return i;
            },
            preProcess:(i)=>{
                i = i.replace(/([0-9]+)장\s*([0-9~-]+)절*/g, "$1:$2");
                i = i.replace("~", "-");
                i = i.replace(/(\d+) *장/g, "$1");
                i = i.replace(/(\d+) *절/g, "$1");
                i = i.replace(/([\u3131-\uD79D]) *(\d+)/ig, "$1 $2");
                i = i.replace(/제 ([3-4])/g, "제$1");
                i = i.replace(/조셉 스미스[—-]/g, "조셉 스미스—");
                //replace commas with semicolons, unless a digit is on both sides of the comma
                i = i.replace(/, *([^0-9])/g, ";  $1");
             //   console.log(i);
                return i;
            }
    }
}