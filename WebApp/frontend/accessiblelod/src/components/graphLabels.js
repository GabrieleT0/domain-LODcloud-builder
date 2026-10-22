// Measure in the rendered font rather than assuming all characters have equal width.
export function fitNodeLabel(title, maxWidth, measure) {
    const text = String(title || '').trim();
    if (measure(text) <= maxWidth) return text;
    const words = text.split(/[\s_\-/–—:]+/u).filter(Boolean);
    const significant = words.filter(word => !/^(the|a|an|of|for|and|in|on|de|des|du|der|die|das|la|le|les|del|di)$/i.test(word));
    if (significant.length > 1) {
        const abbreviation = significant.map(word => /^[A-Z\d]{2,5}$/.test(word) ? word : Array.from(word)[0].toLocaleUpperCase()).join('');
        if (measure(abbreviation) <= maxWidth) return abbreviation;
    }
    const characters = Array.from(text);
    let low = 0;
    let high = characters.length;
    while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (measure(`${characters.slice(0, middle).join('')}…`) <= maxWidth) low = middle;
        else high = middle - 1;
    }
    return low ? `${characters.slice(0, low).join('')}…` : measure('…') <= maxWidth ? '…' : '';
}
