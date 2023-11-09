const { ko } = require("./data/scriptlang.js");
const {lookup, generateReference, setLanguage, detectReferences}= require("./scriptures.js");


const lines = [
    "Please refer to Genesis 20 in the bible",
    "Please refer to 3 Nephi 5:1-3 in the Book of Mormon",
    "For example, in Matthew 27:51, the earth quakes and ro"
]

lines.forEach(l=>{
    const result = detectReferences(l);
    console.log({result});
});

//process.exit(0);

setLanguage("ko");

const ko_lines = [
    "성경의 창세기 20장을 참조하십시오.",
    "이제 제3니파이서 5:1-3을 참조하십시오.",
    "이제 제4니파이서 1:4~5절 참조하십시오.",
    "이제 제4니파이서 1장4~5절 참조하십시오.",
    "이제 제4니파이서 1장 4~5절 참조하십시오.",
    "이제 제4니파이서 1.4~5절 참조하십시오.",
    " 관련하여 힐라맨서 5장 24절에서는 불기둥이 불을 일으키지 않고",
    "이제 모세서 3장 참조하십시오.",
    "이제 참조하십시오.",
    "”흔들리며 떨었느니라”라는 구절에서는 리하이가 하나님과의 경험으로 인해 깊은 감동과 놀람을 느꼈다는 것을 보여줍니다. 이 불기둥의 나타남과 함께 그가 보고 들은 것들은 그에게 큰 충격을 주었고, 그 결과로 그는 흔들리고 떨게 되었습니다. 이러한 경험은 리하이에게 하나님의 존재와 권능을 더욱 확신시켰을 것입니다. 이와 관련하여 힐라맨서 5장 24절에서는 불기둥이 불을 일으키지 않고 그들을 감싸는 것을 본 사람들이 용기를 얻었다고 말하고 있습니다. 이는 리하이의 경험이 그에게 불기둥을 두려워하지 않게 만들었고, 오히려 그의 믿음과 용기를 강화시켰음을 암시합니다. 이러한 이야기들은 우리에게 하나님의 힘과 영적 경험의 중요성을 상기시킵니다. 하나님은 우리의 믿음을 강화시키고 우리에게 영적인 지침과 인도를 주기 위해 다양한 방법으로 말씀하십니다. 우리는 리하이의 경험을 통해 하나님의 지도와 감동에 주목하고, 우리 자신의 믿음을 굳건하게 하기 위해 기도와 영적 경험을 추구해야 함을 배울 수 있습니다. 이렇게 볼 때, ”흔들리며 떨었느니라”라는 구절은 우리에게 하나님의 존재와 돌보심을 믿는 믿음의 중요성을 상기시키는 좋은 예다고 할 수 있습니다. 이 경험을 통해 리하이는 예루살렘 시민들에게 하나님의 경고를 전할 용기를 얻었으며, 우리도 우리의 믿음을 강화하고 하나님의 뜻을 따르기 위해 영적 경험을 추구할 수 있습니다. (니파이전서 1장 6절; 힐라맨서 5장 24절)",
]
ko_lines.forEach(l=>{
    let callback = (string)=>{
        return `[${string}]`
    }
    const result = detectReferences(l,callback);
    console.log({result});
});