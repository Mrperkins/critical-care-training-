/** The old "Use offline" card, now a pointer to the library's Offline page (downloads by pack, with sizes). */
import { openLibrary } from '../library/launch';

export function OfflineCard() {
  return (
    <section className="card offline-card" aria-label="Use offline">
      <div className="card-h"><h3>Use offline</h3></div>
      <p className="small">The app and its 3D models are kept on this device after your first visit. Download narration, audio, imaging and conference packs from the Offline page.</p>
      <div className="chips"><button type="button" className="chip on" onClick={() => openLibrary({ page: 'offline' })}>Open offline downloads</button></div>
    </section>
  );
}
