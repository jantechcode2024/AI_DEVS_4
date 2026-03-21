
const CHUNK_SIZE = 5000;
const CHUNK_OVERLAP = 500;
const SEPARATORS = ["\n"];

export const chunkBySeparators = (text, { source, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP } = {}) => {
    const chunks = split(text, size, overlap, SEPARATORS);
    return chunks.map((content, i) => ({
        content,
        metadata: {
          strategy: "separators",
          index: i,
          chars: content.length,
          source: source ?? null,
        },
      }));
}



// ── Recursive chunk split ────────────────────────────────────────────
const split = (text, size, overlap, separators) => {
    if (text.length <= size) return [text];

    const sep = separators.find((s) => text.includes(s));
    if (!sep) return [text]

    const parts = text.split(sep);
    const chunks = [];
    let current = "";

    for (const part of parts) {
        const candidate = current ? current + sep + part : part;
        if (candidate.length > size && current) {
            chunks.push(current);
            const overlapText = pickOverlap(current, overlap, sep);
            current = overlapText ? overlapText + sep + part : part;
        } else {
            current = candidate;
        }
    }

    const remaining = separators.slice(separators.indexOf(sep) + 1);
    return chunks.flatMap((c) =>
      c.length > size && remaining.length ? split(c, size, overlap, remaining) : [c]
    );
}


// ── Overlap helper ─────────────────────────────────────────────

const pickOverlap = (text, overlap, sep) => {
    if (overlap <= 0) return "";
  
    const start = Math.max(0, text.length - overlap);
    const tail = text.slice(start);
  
    let idx = tail.search(/\n/);
    if (idx === -1) idx = tail.search(/\s/);
    if (idx === -1) return "";
  
    let overlapText = text.slice(start + idx + 1);
    if (sep && overlapText.startsWith(sep)) {
      overlapText = overlapText.slice(sep.length);
    }
  
    return overlapText;
  };
