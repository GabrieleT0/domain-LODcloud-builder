const ratio = (numerator, denominator, guard = false) => ({ numerator, denominator, guard });
const cases = (...branches) => ({ branches });
const dataDimensions = new Set(['Image', 'Audio', 'Video', 'Data Lang', 'Labels', 'Alt', 'Audio description', 'Video description', 'signLang_video', 'signLang_audio', 'captions_video', 'captions_audio', 'transcript_video', 'transcript_audio']);
const requirements = { Alt: 'Image', 'Audio description': 'Audio', 'Video description': 'Video', signLang_video: 'Video', signLang_audio: 'Audio', captions_video: 'Video', captions_audio: 'Audio', transcript_video: 'Video', transcript_audio: 'Audio' };
const dimension = (name, description, scoring) => ({
  name, description, scoring,
  level: dataDimensions.has(name) ? 'D' : 'M',
  requirement: requirements[name],
});

export const accessibilityTables = [
  {
    id: 'table-1',
    title: 'Accessibility for All',
    caption: 'Accessibility dimensions, their definitions, data (D) or metadata (M) level, and scoring functions on a 0–1 scale.',
    groups: [
      {
        name: 'Perceivable',
        rows: [
          dimension('Image metadata', 'Metadata include a visual representation of the dataset.', cases(['1', 'present'], ['0', 'otherwise'])),
          dimension('Image', 'Visual element enriching a dataset’s expressiveness, accessibility, and multimodal value.', ratio('# resources with images src', '# resources')),
          dimension('Audio metadata', 'Metadata include an audio representation of the dataset.', cases(['1', 'present'], ['0', 'otherwise'])),
          dimension('Audio', 'Audio element enriching a dataset’s expressiveness, accessibility, and multimodal value.', ratio('# resources with audio src', '# resources')),
          dimension('Video metadata', 'Metadata include a video representation of the dataset.', cases(['1', 'present'], ['0', 'otherwise'])),
          dimension('Video', 'Video element enriching a dataset’s expressiveness, accessibility, and multimodal value.', ratio('# resources with video src', '# resources')),
        ],
      },
      {
        name: 'Understandable',
        rows: [
          dimension('Metadata Lang', 'Metadata specify language tags.', ratio('# metadata tags with lang tag', '# metadata tags')),
          dimension('Data Lang', 'Data triples specify language tags.', cases(['1', 'lang tag at data level ≥ 1'], ['0', 'otherwise'])),
          dimension('Labels', 'Ratio of resources with human-readable labels.', ratio('# resources with a rdfs:label', '# resources')),
          dimension('Examples', 'Examples of access point usage provided, as exemplary SPARQL queries.', cases(['1', 'present'], ['0', 'otherwise'])),
          dimension('Description readability', 'Degree to which the dataset description uses clear, plain language to ensure broad accessibility and comprehension. Computed via normalised LIX index.', { kind: 'readability' }),
        ],
      },
      {
        name: 'Operable',
        rows: [
          dimension('Contact person', 'Maintainer or responsible party is explicitly reported.', cases(['1', 'name and email are present'], ['0', 'otherwise'])),
          dimension('Dump size', 'Dump available in compressed, validated format.', cases(['1', 'Data dump size < 500MB'], ['0.5', 'Data dump size in [500MB, 4GB]'], ['0', 'otherwise'])),
          dimension('Auth', 'Endpoint access requires credentials (discouraged).', cases(['1', 'free access to the SPARQL endpoint'], ['0', 'otherwise'])),
          dimension('Dump format', 'Dataset dump uses valid RDF serialization (Turtle, JSON-LD, RDF/XML).', cases(['1', 'dump in a valid serialization format'], ['0.5', 'a dump is provided, but not in a valid format'], ['0', 'otherwise'])),
          dimension('Open License', 'The use of an open license, expressed as a URL, to ensure free (re)use.', cases(['1', 'clearly identifiable and open license'], ['0.5', 'clearly identifiable, but not an open license'], ['0', 'missing license'])),
          dimension('Access points', 'Dataset accessible via multiple access points (SPARQL endpoint, dump, API).', cases(['1', '≥ 2 access points'], ['0', 'otherwise'])),
        ],
      },
      {
        name: 'Robust',
        rows: [
          dimension('Versioning', 'Explicit dataset versioning to track changes.', cases(['1', 'the version can be identified'], ['0', 'otherwise'])),
          dimension('Webpage broken link', 'Guarantees that the dataset’s webpage is provided and accessible (i.e., not a broken link).', cases(['1', 'URL webpage returns [200] or [300, 399] as a status code'], ['0', 'otherwise'])),
          dimension('Broken metadata link rate', 'The proportion of metadata links that fail to resolve.', ratio('# working metadata links', '# metadata links')),
          dimension('Canonical ID', 'Unique persistent ID (e.g., DOI) provided.', cases(['1', 'present'], ['0', 'otherwise'])),
        ],
      },
    ],
  },
  {
    id: 'table-2',
    title: 'Accessibility for Special Need groups',
    caption: 'Accessibility dimensions for users with special needs, their computational methods, and required media.',
    groups: [
      {
        name: 'Accessibility for Blind or Visually Impaired Users',
        rows: [
          dimension('Alt', 'Ratio of images with descriptive alt-text.', ratio('# images with alt-text', '# images', true)),
          dimension('Audio description', 'Presence of resources with audio description.', ratio('# resources with audio description', '# resources')),
        ],
      },
      {
        name: 'Accessibility for Deaf or Hard-of-hearing Users',
        rows: [
          dimension('Video description', 'Presence of resources with audio representation.', ratio('# resources with video description', '# resources')),
          dimension('signLang_video', 'Sign language video.', ratio('# video with interpretation', '# video', true)),
          dimension('signLang_audio', 'Sign language audio.', ratio('# audio with interpretation', '# audio', true)),
          dimension('captions_video', 'Ratio of videos with synchronized captions.', ratio('# video with captions', '# video', true)),
          dimension('captions_audio', 'Ratio of audio with synchronized captions.', ratio('# audio with captions', '# audio', true)),
          dimension('transcript_video', 'Ratio of videos with text transcript.', ratio('# video with transcript', '# video', true)),
          dimension('transcript_audio', 'Ratio of audio with text transcript.', ratio('# audio with transcript', '# audio', true)),
        ],
      },
    ],
  },
];
