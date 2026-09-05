const ratio = (numerator, denominator, offset = 0) => ({ numerator, denominator, offset });
const cases = (...branches) => ({ branches });

export const accessibilityTables = [
  {
    id: 'table-1',
    title: 'Accessibility for All',
    caption: 'Accessibility for All parameters are documented with their name, a brief textual description, the associated level—distinguishing between data (D) and metadata (M)—and the corresponding scoring function.',
    groups: [
      {
        name: 'Perceivable',
        rows: [
          { name: 'Image metadata', description: 'Presence of metadata representations as an image.', level: 'M', scoring: cases(['1', 'present'], ['0', 'otherwise']) },
          { name: 'Image', description: 'Visual element enriching a dataset’s expressiveness, accessibility, and multimodal value.', level: 'D', scoring: ratio('# resources with images src', '# triples') },
          { name: 'Audio metadata', description: 'Presence of metadata representations as an audio.', level: 'M', scoring: cases(['1', 'at least an audio present'], ['0', 'otherwise']) },
          { name: 'Audio', description: 'Audio element enriching a dataset’s expressiveness, accessibility, and multimodal value.', level: 'D', scoring: ratio('# resources with audio src', '# triples') },
          { name: 'Video metadata', description: 'Presence of metadata representations as a video.', level: 'M', scoring: cases(['1', 'at least a video present'], ['0', 'otherwise']) },
          { name: 'Video', description: 'Video element enriching a dataset’s expressiveness, accessibility, and multimodal value.', level: 'D', scoring: ratio('# resources with video src', '# triples') },
        ],
      },
      {
        name: 'Understandable',
        rows: [
          { name: 'Metadata Lang', description: 'Metadata tags specify language.', level: 'M', scoring: ratio('# metadata tags with lang tag', '# metadata tags', -1) },
          { name: 'Data Lang', description: 'Data triples specify language.', level: 'D', scoring: cases(['0', 'if at least a lang is specified'], ['−1', 'otherwise']) },
          { name: 'Labels', description: 'Ratio of resources with human-readable labels.', level: 'D', scoring: ratio('# of resources with a rdfs:label', '# of triples', -1) },
          { name: 'Examples', description: 'Examples of access point usage provided, as exemplary SPARQL queries.', level: 'M', scoring: cases(['1', 'present'], ['0', 'otherwise']) },
          { name: 'Description readability', description: 'Degree to which the dataset description uses clear, plain language to ensure broad accessibility and comprehension. Computed via Flesh Reading Easy score (FR).', level: 'M', scoring: cases(['1', 'FR > 100'], ['−1', 'FR < −1'], ['FR / 50 − 1', 'otherwise']) },
        ],
      },
      {
        name: 'Operable',
        rows: [
          { name: 'Contact person', description: 'Maintainer or responsible party is explicitly reported.', level: 'M', scoring: cases(['1', 'present'], ['0', 'otherwise']) },
          { name: 'Dump size', description: 'Dump available in compressed, validated format.', level: 'M', scoring: cases(['1', 'Data dump size < 500MB'], ['0', 'Data dump size in [500MB, 4GB]'], ['−1', 'Data dump size > 4GB']) },
          { name: 'Auth', description: 'Endpoint access requires credentials (discouraged).', level: 'M', scoring: cases(['0', 'free access to the SPARQL endpoint'], ['−1', 'otherwise']) },
          { name: 'Dump format', description: 'Dataset dump uses valid RDF serialization (Turtle, JSON-LD, RDF/XML).', level: 'M', scoring: cases(['0', 'dump in a valid serialization format'], ['−1', 'otherwise']) },
          { name: 'Open License', description: 'The use of an open license, expressed as a URL, to ensure free (re)use.', level: 'M', scoring: cases(['1', 'open license'], ['0', 'missing license'], ['−1', 'non-open license']) },
          { name: 'Alternative access points', description: 'Dataset accessible via multiple access points (SPARQL endpoint, dump, API).', level: 'M', scoring: cases(['1', '2+ access points'], ['0', 'otherwise']) },
        ],
      },
      {
        name: 'Robust',
        rows: [
          { name: 'Versioning', description: 'Explicit dataset versioning to track changes.', level: 'M', scoring: cases(['0', 'standard versioning'], ['−1', 'otherwise']) },
          { name: 'robots_txt', description: 'Presence of robots.txt reference in metadata.', level: 'M', scoring: cases(['1', 'present'], ['0', 'otherwise']) },
          { name: 'Webpage broken link', description: 'Guarantees that the dataset’s webpage is provided and accessible (i.e., not a broken link).', level: 'M', scoring: cases(['0', 'URL webpage returns [200, 399] as a status code'], ['−1', 'otherwise']) },
          { name: 'Broken metadata link rate', description: 'The proportion of dataset metadata links that fail to resolve.', level: 'M', scoring: ratio('# broken metadata links', '# metadata links', -1) },
          { name: 'Canonical ID', description: 'Unique persistent ID (e.g., DOI) provided.', level: 'M', scoring: cases(['1', 'present'], ['0', 'otherwise']) },
        ],
      },
    ],
  },
  {
    id: 'table-2',
    title: 'Accessibility for Special Need groups',
    caption: 'Accessibility for Special Need groups parameters.',
    groups: [
      {
        name: 'Accessibility for Visually Impaired',
        rows: [
          { name: 'Alt', description: 'Ratio of images with descriptive alt-text.', level: 'D', scoring: ratio('# images with alt-text', '# images', -1), requirement: 'Image' },
          { name: 'Audio description', description: 'Presence of entities with audio description.', level: 'D', scoring: ratio('# entities with audio description', '# entities', -1), requirement: 'Audio' },
        ],
      },
      {
        name: 'Accessibility for Deaf or Hard-of-hearing Users',
        rows: [
          { name: 'Video description', description: 'Presence of entities with audio representation.', level: 'D', scoring: cases(['0', 'at least a video description exists'], ['−1', 'otherwise']), requirement: 'Video' },
          { name: 'signLang_video', description: 'Sign language video.', level: 'D', scoring: ratio('# video with interpretation', '# video', -1), requirement: 'Video' },
          { name: 'signLang_audio', description: 'Sign language audio.', level: 'D', scoring: ratio('# audio with interpretation', '# audio', -1), requirement: 'Audio' },
          { name: 'captions_video', description: 'Ratio of videos with synchronized captions.', level: 'D', scoring: ratio('# video with captions', '# video', -1), requirement: 'Video' },
          { name: 'captions_audio', description: 'Ratio of audio with synchronized captions.', level: 'D', scoring: ratio('# audio with captions', '# audio', -1), requirement: 'Audio' },
          { name: 'transcript_video', description: 'Ratio of videos with text transcript.', level: 'D', scoring: ratio('# videos with transcript', '# video', -1), requirement: 'Video' },
          { name: 'transcript_audio', description: 'Ratio of audio with text transcript.', level: 'D', scoring: ratio('# audio with transcript', '# audio', -1), requirement: 'Audio' },
        ],
      },
    ],
  },
];
