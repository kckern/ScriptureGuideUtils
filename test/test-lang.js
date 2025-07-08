import { lookupReference, generateReference, detectReferences } from '../src/scriptures.mjs';

const tests = [
    { label: "English", ref: "alma 26" },
    { label: "Vietnamese", ref: "An Ma 26", lang: "vn" },
    { label: "Korean", ref: "앨마 26", lang: "ko" },
    { label: "Russian 1.1", ref: "Алма 26", lang: "ru" },
    { label: "Russian 1.2", ref: "алма 26", lang: "ru" },
    { label: "Russian 2.1", ref: "1фессалоникийцам 2", lang: "ru" },
    { label: "Russian 2.2", ref: "фессалоникийцам 1", lang: "ru" }
];

for (const { label, ref, lang } of tests) {
    const result = lookupReference(ref, lang).verse_ids.length ? "✅" : "❌";
    console.log(`${result} ${label} (${ref})`);
}
