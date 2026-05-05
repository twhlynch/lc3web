export const LC3Util = {
    /**
     * Parse an LC3 literal value
     * returns the number, or NaN if invalid
     *
     * @param {string} text
     */
    parseNumber: function(text) {
        const normalised = text.toLowerCase();

        // count '-'s
        const signs = (normalised.match(/-/g) || []).length;
        if (signs > 1) return NaN;

        const sign = (signs === 1) ? -1 : 1;
        const rest = normalised.replace('-', '');

        // hex 0x00 -0x00 0x-00 x00 -x00 x-00
        const hexMatch = rest.match(/^0?x([0-9a-f]+)$/);
        if (hexMatch) return parseInt(hexMatch[1], 16) * sign;

        // binary b0 -b0 b-0 b-0 0b0 -0b0 0b-0
        const binMatch = rest.match(/^0?b([01]+)$/);
        if (binMatch) return parseInt(binMatch[1], 2) * sign;

        // decimal #0 #-0 -#0 -0 0 00 #00 -#00 #-00
        const decMatch = rest.match(/^#?(\d+)$/);
        if (decMatch) return parseInt(decMatch[1], 10) * sign;

        return NaN;
    },

    /*
     * Converts a number to a four-digit hexadecimal string with 'x' prefix.
     */
    toHexString: function(value, padLength) {
        var hex = value.toString(16).toUpperCase();
        padLength = padLength || 4;
        if (hex.length < padLength) {
            hex = (Array(padLength - hex.length + 1).join('0')) + hex;
        }
        return 'x' + hex;
    },

    /*
     * Converts a number possibly outside the [-32768, 32767] range
     * to a 16-bit signed integer.
     */
    toInt16: function(n) {
        n = (n % 0x10000) & 0xFFFF;
        if (n & 0x8000) {
            return n - 0x10000;
        }
        return n;
    },

    toUint16: function(n) {
        var int16 = this.toInt16(n);
        return int16 < 0 ? int16 + 0x10000 : int16;
    },

    /*
     * Sign-extends a size-bit number n to 16 bits.
     */
    signExtend16: function(n, size) {
        var sign = (n >> (size - 1)) & 1;
        if (sign === 1) {
            for (var i = size; i < 16; i++) {
                n |= (1 << i);
            }
        } else {
            n &= (1 << size) - 1;
        }
        return this.toInt16(n);
    },
};
