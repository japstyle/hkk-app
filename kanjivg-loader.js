/**
 * Utility to fetch and parse KanjiVG data from jsDelivr CDN
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
     * Fetches paths for a single character
     */
    fetchPaths: async function (char) {
        if (this.cache[char]) return this.cache[char];

        const hex = this.getHex(char);
        const url = `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg@master/kanji/${hex}.svg`;

        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Failed to fetch character: ${char}`);

            const svgText = await resp.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, "image/svg+xml");

            // KanjiVG paths are usually in a <g id="kvg:04eba-g1"> group
            // but we can just grab all <path> elements that have a 'd' attribute
            const paths = Array.from(doc.querySelectorAll("path"))
                .map(p => p.getAttribute("d"))
                .filter(d => d && !d.includes("stroke")); // Filter out any potential non-path elements

            // Sometimes the first few paths might be labels or metadata groups if the selector is too broad,
            // but KanjiVG's structure is usually very clean.
            // Specifically, we want paths that represent the strokes.

            this.cache[char] = paths;
            return paths;
        } catch (err) {
            console.error(err);
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
