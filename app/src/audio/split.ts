/** Splits a long episode transcript into narration parts at paragraph, then sentence, boundaries. */
export const MAX_PART_CHARS = 4400;

export function splitTranscript(text: string, MAX_CHARS = MAX_PART_CHARS) {
  const paragraphs = text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const parts: string[] = []; let cur = '';
  const push = () => { if (cur.trim()) parts.push(cur.trim()); cur = ''; };
  for (const p of paragraphs) {
    if ((cur ? cur.length + 2 : 0) + p.length <= MAX_CHARS) {
      cur += (cur ? '\n\n' : '') + p; continue;
    }
    push();
    if (p.length <= MAX_CHARS) { cur = p; continue; }
    // Very long paragraph: preserve sentence boundaries where possible.
    const sentences = p.match(/[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g) ?? [p];
    for (const raw of sentences) {
      const sentence = raw.trim();
      if ((cur ? cur.length + 1 : 0) + sentence.length > MAX_CHARS) push();
      if (sentence.length > MAX_CHARS) {
        for (let i = 0; i < sentence.length; i += MAX_CHARS) parts.push(sentence.slice(i, i + MAX_CHARS));
      } else cur += (cur ? ' ' : '') + sentence;
    }
  }
  push(); return parts;
}

