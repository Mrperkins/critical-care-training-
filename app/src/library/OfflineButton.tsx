/** Header button for the Offline page; shows "Offline" in amber when the device has no connection. */
import { openLibrary } from './launch';
import { useOnline } from './OfflinePage';

export function OfflineButton({ on }: { on: boolean }) {
  const online = useOnline();
  return (
    <button className={`lib-offline-btn${online ? '' : ' is-offline'}${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}
      aria-label={online ? 'Offline downloads' : 'You are offline. Offline downloads'} title={online ? 'Download for offline' : 'You are offline — saved content still works'}
      onClick={() => openLibrary({ page: 'offline' })}>
      {online
        ? <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.4 4.4 0 0 0 7 18z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10v6m-2.6-2.6L12 16l2.6-2.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        : <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.4 4.4 0 0 0 7 18z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
      <span className="lib-offline-btn-t">{online ? 'Offline' : 'Offline now'}</span>
    </button>
  );
}
