export type VideoFormat = 'short' | 'long';
export type VideoLevel = 'foundational' | 'intermediate' | 'advanced';
export type VideoIntent = 'learn' | 'setup' | 'perform' | 'manage' | 'troubleshoot' | 'case-review';
export type VideoReviewStatus = 'listed' | 'review';
export type VideoProvider = 'youtube' | 'html5' | 'embed' | 'external';
export type VideoSourceClass = 'educator' | 'manufacturer';

export interface VideoCategoryDefinition {
  id: string;
  label: string;
  description: string;
  subcategories: { id: string; label: string }[];
}

export interface ClinicalVideo {
  id: string;
  title: string;
  channel: string;
  youtubeId?: string;
  provider?: VideoProvider;
  sourceClass?: VideoSourceClass;
  sourceUrl?: string;
  embedUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  sourceLabel?: string;
  format: VideoFormat;
  category: string;
  subcategory: string;
  intents: VideoIntent[];
  level: VideoLevel;
  tags: string[];
  summary: string;
  reviewStatus: VideoReviewStatus;
  featured?: boolean;
  published?: string;
  durationSeconds?: number;
  pairedLongFormId?: string;
}

export interface VideoFilters {
  query: string;
  category: string | null;
  subcategory: string | null;
  format: VideoFormat | null;
  level: VideoLevel | null;
  intent: VideoIntent | null;
}
