/**
 * Utility to fetch and parse KanjiVG stroke data.
 * Sources (tried in order):
 *   1. raw.githubusercontent.com (reliable, no size limit)
 *   2. jsDelivr CDN (faster when cached)
 *
 * KanjiVG (CC BY-SA 3.0) — https://kanjivg.tagaini.net
 */
const KanjiVGLoader = {
    cache: {},

    /**
     * Converts a character to its 5-digit hex code
     */
    getHex: function (char) {
        let hex = char.charCodeAt(0).toString(16).toLowerCase();
        while (hex.length < 5) hex = "0" + hex;
        return hex;
    },

    /**
     * Fetches and parses stroke paths for a single character
     */
    fetchPaths: async function (char) {
        if (this.cache[char]) return this.cache[char];

        const hex = this.getHex(char);
        let svgText = null;

        // Try sources in order
        const sources = [
            `https://raw.githubusercontent.com/kanjivg/kanjivg/master/kanji/${hex}.svg`,
            `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg@r20250816/kanji/${hex}.svg`
        ];

        for (const url of sources) {
            try {
                const resp = await fetch(url);
                if (resp.ok) {
                    svgText = await resp.text();
                    break;
                }
            } catch (_) {
                // Try next source
            }
        }

        if (!svgText) {
            console.warn(`KanjiVGLoader: could not fetch data for ${char}`);
            return null;
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, "image/svg+xml");

            // KanjiVG SVGs contain stroke <path> elements with `d` attributes.
            // Non-stroke elements use <text> not <path>, so this selector is safe.
            const paths = Array.from(doc.querySelectorAll("path"))
                .map(p => p.getAttribute("d"))
                .filter(d => d);

            this.cache[char] = paths;
            return paths;
        } catch (err) {
            console.warn(`KanjiVGLoader: failed to parse SVG for ${char}`, err);
            return null;
        }
    },

    /**
     * Fetches paths for all characters in a string
     */
    fetchWord: async function (word) {
        const results = await Promise.all(
            Array.from(word).map(char => this.fetchPaths(char))
        );
        return results.every(r => r !== null);
    }
};
