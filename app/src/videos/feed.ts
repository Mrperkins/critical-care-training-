export function buildFeedEmbedUrl(videoId: string, origin: string, autoplay: boolean) {
  const params = new URLSearchParams({
    enablejsapi: '1',
    origin,
    playsinline: '1',
    controls: '0',
    rel: '0',
    loop: '1',
    playlist: videoId,
    mute: '1',
    autoplay: autoplay ? '1' : '0',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

export function mostVisibleVideoId(
  ids: string[],
  ratios: ReadonlyMap<string, number>,
  minimumRatio = 0.51,
) {
  let bestId: string | null = null;
  let bestRatio = 0;
  for (const id of ids) {
    const ratio = ratios.get(id) ?? 0;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestId = id;
    }
  }
  return bestId && bestRatio >= minimumRatio ? bestId : null;
}

export function inFeedPreloadWindow(index: number, activeIndex: number, radius = 1) {
  return Math.abs(index - activeIndex) <= radius;
}
