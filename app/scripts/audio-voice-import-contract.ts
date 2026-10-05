export interface VoiceLine {
  id: string;
  transcriptHash: string;
}

export interface VoiceImportAssetRequest {
  id: string;
  transcriptHash?: string;
  file?: string;
  url?: string;
  voice?: string;
  provider?: string;
  replaceCurrent?: boolean;
}

export interface VoiceImportRequest {
  assets?: VoiceImportAssetRequest[];
}

export interface VoiceManifestAsset {
  id: string;
  transcriptHash?: string;
  file?: string;
}

export interface VoiceManifest {
  assets?: VoiceManifestAsset[];
}

export const expectedVoiceFile = (id: string, transcriptHash: string) =>
  `${id}.v${transcriptHash}.mp3`;

export function validateVoiceImportRequest(
  request: VoiceImportRequest,
  lines: VoiceLine[],
  manifest: VoiceManifest = { assets: [] },
): string[] {
  const errors: string[] = [];
  const canonical = new Map(lines.map((line) => [line.id, line]));
  const durable = new Map((manifest.assets ?? []).map((asset) => [asset.id, asset]));
  const seenIds = new Set<string>();
  const seenUrls = new Map<string, string>();

  for (const asset of request.assets ?? []) {
    if (!asset?.id) {
      errors.push('voice import asset is missing id');
      continue;
    }
    if (seenIds.has(asset.id)) errors.push(`${asset.id}: duplicate import request id`);
    seenIds.add(asset.id);

    const line = canonical.get(asset.id);
    if (!line) {
      errors.push(`${asset.id}: no canonical transcript in lines.json`);
      continue;
    }
    if (!asset.transcriptHash) {
      errors.push(`${asset.id}: transcriptHash is required`);
    } else if (asset.transcriptHash !== line.transcriptHash) {
      errors.push(
        `${asset.id}: requested transcriptHash ${asset.transcriptHash} does not match canonical ${line.transcriptHash}`,
      );
    }

    if (asset.transcriptHash) {
      const expected = expectedVoiceFile(asset.id, asset.transcriptHash);
      if (!asset.file) errors.push(`${asset.id}: file is required and must be ${expected}`);
      else if (asset.file !== expected) errors.push(`${asset.id}: file must be ${expected}`);
    }

    if (!asset.url) {
      errors.push(`${asset.id}: url is required`);
    } else {
      let parsed: URL | undefined;
      try { parsed = new URL(asset.url); } catch { /* handled below */ }
      if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) {
        errors.push(`${asset.id}: url must be an http(s) URL`);
      }
      const previous = seenUrls.get(asset.url);
      if (previous && previous !== asset.id) {
        errors.push(`${asset.id}: url is already assigned to ${previous}`);
      } else {
        seenUrls.set(asset.url, asset.id);
      }
    }

    const current = durable.get(asset.id);
    if (
      current?.transcriptHash === line.transcriptHash &&
      !asset.replaceCurrent
    ) {
      errors.push(`${asset.id}: durable asset is already current; set replaceCurrent=true only for an intentional replacement`);
    }
  }

  return errors;
}
