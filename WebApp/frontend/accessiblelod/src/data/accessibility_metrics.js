import { accessibilityTables } from './accessibility_tables';

// Framework names are the display labels; these keys identify API score fields.
const metricKeys = {
  'Image metadata': 'image_metadata',
  Image: 'image',
  'Audio metadata': 'audio_meta',
  Audio: 'audio',
  'Video metadata': 'video_meta',
  Video: 'video',
  'Metadata Lang': 'metadata_lang',
  'Data Lang': 'data_lang',
  Labels: 'human_redeable_labels',
  Examples: 'example',
  'Description readability': 'description_readability',
  'Contact person': 'contact_point',
  'Dump size': 'dump_size',
  Auth: 'check_authentication',
  'Dump format': 'common_format_availability',
  'Open License': 'open_license',
  'Access points': 'alternative_access_point',
  Versioning: 'version',
  'Webpage broken link': 'webpage_status',
  'Broken metadata link rate': 'metadata_broken_links_rate',
  'Canonical ID': 'canonical_citation',
  Alt: 'alt_image',
  'Audio description': 'audio_description_ratio',
  'Video description': 'video_description_ratio',
  signLang_video: 'video_sign_language_ratio',
  signLang_audio: 'audio_sign_language_ratio',
  captions_video: 'video_subtitle_ratio',
  captions_audio: 'audio_subtitle_ratio',
  // Transcript dimensions use the description scores in the current score CSV.
  transcript_video: 'video_description_ratio',
  transcript_audio: 'audio_description_ratio',
};

const dimensionScore = value => {
  if (value == null || String(value).trim() === '') return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) && number >= 0 && number <= 1 ? number : null;
};

export const getAccessibilityMetrics = (scores = {}) => accessibilityTables.flatMap(table =>
  table.groups.flatMap(group => group.rows.map(row => ({
    key: row.name,
    label: row.name,
    category: group.name,
    value: dimensionScore(scores[metricKeys[row.name]]),
  })))
);
