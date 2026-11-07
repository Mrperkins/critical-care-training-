/** Minimal, matching format symbols; always accompanied by a visible or screen-reader label. */
export type ContentFormat = 'visual' | 'audio';
export function ContentFormatIcon({ kind, size = 18 }: { kind: ContentFormat; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === 'visual'
      ? <>
          <rect x="2.5" y="4.5" width="19" height="14" rx="2.3" />
          <path d="M8 21h8M12 18.5V21" />
          <path d="M6.5 11.5c1.6-2.1 3.5-3.2 5.5-3.2s3.9 1.1 5.5 3.2c-1.6 2.1-3.5 3.2-5.5 3.2s-3.9-1.1-5.5-3.2Z" />
          <circle cx="12" cy="11.5" r="1.5" />
        </>
      : <>
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          <rect x="2.5" y="13" width="4" height="7" rx="1.5" />
          <rect x="17.5" y="13" width="4" height="7" rx="1.5" />
          <path d="M9 13v3m3-6v8m3-5v3" />
        </>}
  </svg>;
}
