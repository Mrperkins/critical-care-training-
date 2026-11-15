import { conditionsFor } from './registry';
import type { AtlasDomain } from './types';
/** Top-bar entry to a domain's condition atlas (kept apart from AtlasModule so it costs nothing to show). */
export function AtlasEntry({ domain, onOpen }: { domain: AtlasDomain; onOpen: () => void }) {
  const count = conditionsFor(domain).length;
  return <button className="atlas-entry" onClick={onOpen} title="Open the condition atlas for this domain">{count} conditions</button>;
}
