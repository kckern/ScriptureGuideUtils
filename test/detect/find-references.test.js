import { findReferences } from '../../src/scriptures.mjs';

describe('findReferences (basic)', () => {
    test('single reference with correct offsets', () => {
        const text = 'Please read John 3:16 tonight.';
        const results = findReferences(text, { contextAware: false });
        expect(results).toHaveLength(1);
        const m = results[0];
        expect(text.slice(m.start, m.end)).toBe('John 3:16');
        expect(m.text).toBe('John 3:16');
        expect(m.verse_ids).toEqual([26137]);
    });

    test('multiple references, sorted by position', () => {
        const text = 'Compare Genesis 1:1 with John 3:16 and also Alma 32:21 for insight.';
        const results = findReferences(text, { contextAware: false });
        expect(results.length).toBeGreaterThanOrEqual(2);
        const texts = results.map(m => text.slice(m.start, m.end));
        expect(texts.join(' ')).toContain('Genesis 1:1');
        const starts = results.map(m => m.start);
        expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    });

    test('every result slice equals its text field', () => {
        const text = 'See Matthew 5:3-12 and John 3:16. Later, 1 Nephi 3:7 is quoted.';
        for (const m of findReferences(text, { contextAware: false })) {
            expect(text.slice(m.start, m.end)).toBe(m.text);
            expect(m.verse_ids.length).toBeGreaterThan(0);
        }
    });

    test('no references returns empty array', () => {
        expect(findReferences('Nothing to see here in 2026.', { contextAware: false })).toEqual([]);
        expect(findReferences('', { contextAware: false })).toEqual([]);
    });
});
