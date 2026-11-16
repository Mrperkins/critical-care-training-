/**
 * Progress backup. Everything the app remembers (finished lessons, case stars, exam history, review marks, audio
 * position) lives in this browser. A backup is one small file with all of it, so it can be kept safe or moved to
 * another phone or computer. Nothing is sent anywhere.
 */
const OURS = (k: string) => k.startsWith('cc.') || k.startsWith('ccp.');
export interface Backup { app: 'critical-care-training'; version: 1; savedAt: string; data: Record<string, string> }
export function makeBackup(store: Storage = localStorage, now = new Date()): Backup {
  const data: Record<string, string> = {};
  for (let i = 0; i < store.length; i++) { const k = store.key(i); if (k && OURS(k)) data[k] = store.getItem(k) ?? ''; }
  return { app: 'critical-care-training', version: 1, savedAt: now.toISOString(), data };
}
export function readBackup(text: string): Backup {
  let b: Backup; try { b = JSON.parse(text); } catch { throw new Error('That file is not a progress backup.'); }
  if (b?.app !== 'critical-care-training' || typeof b.data !== 'object' || !b.data) throw new Error('That file is not a progress backup from this app.');
  for (const [k, v] of Object.entries(b.data)) if (!OURS(k) || typeof v !== 'string') throw new Error('That backup has entries this app does not recognise.');
  return b;
}
/** Replace this browser's progress with the backup's. Keys the backup does not hold are cleared, so the result matches the file. */
export function restoreBackup(b: Backup, store: Storage = localStorage) {
  const drop: string[] = []; for (let i = 0; i < store.length; i++) { const k = store.key(i); if (k && OURS(k) && !(k in b.data)) drop.push(k); }
  drop.forEach((k) => store.removeItem(k)); for (const [k, v] of Object.entries(b.data)) store.setItem(k, v);
  return Object.keys(b.data).length;
}
export function downloadBackup() {
  const b = makeBackup(); const url = URL.createObjectURL(new Blob([JSON.stringify(b)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = `critical-care-progress-${b.savedAt.slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  try { localStorage.setItem('ccp.backup.at', b.savedAt); } catch { /* storage unavailable */ }
  return Object.keys(b.data).length;
}
/** Ask the browser not to clear this site's data when the device runs low on space. */
export function keepStorage() { try { void navigator.storage?.persist?.(); } catch { /* not supported */ } }
