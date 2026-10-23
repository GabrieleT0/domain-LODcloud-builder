import Navbar from '../components/navbar';

const categories = [
  {
    title: 'Perceivable',
    description: 'Checks whether dataset metadata indicates images, audio, and video that can help people understand the data.',
  },
  {
    title: 'Understandable',
    description: 'Looks at language information, human-readable labels, examples, and the readability of dataset descriptions.',
  },
  {
    title: 'Operable',
    description: 'Examines practical ways to access and reuse a dataset, including contact details, licensing, dumps, and access points.',
  },
  {
    title: 'Robust',
    description: 'Checks signals such as version information, persistent identifiers, and working dataset and metadata links.',
  },
  {
    title: 'Visual accessibility',
    description: 'Looks for image alternatives and audio descriptions relevant to people who are blind or have low vision.',
  },
  {
    title: 'Hearing accessibility',
    description: 'Looks for captions, transcripts, and sign-language support relevant to people who are deaf or hard of hearing.',
  },
];

function About() {
  return (
    <div className="container-fluid mt-3 px-4">
      <Navbar />
      <main className="container py-4">
        <header className="mb-5">
          <p className="text-uppercase fw-semibold mb-2" style={{ color: '#238f91', letterSpacing: '0.08em' }}>
            About the project
          </p>
          <h1 className="display-5 fw-bold mb-3">AccessibleLOD</h1>
          <p className="lead" style={{ maxWidth: '850px' }}>
            Linked Open Data can be technically available and still be difficult for people to find,
            understand, compare, or reuse. AccessibleLOD brings a human-centred view of accessibility
            to the Linked Open Data (LOD) Cloud.
          </p>
          <p style={{ maxWidth: '850px' }}>
            Explore dataset relationships, review accessibility scores, and inspect the metadata that
            helps people judge whether a dataset is right for their needs. The project extends the
            quality-assessment perspective of KGHeartBeat with accessibility indicators inspired by
            the Web Content Accessibility Guidelines (WCAG) and FAIR data principles.
          </p>
          <p style={{ maxWidth: '850px' }}>
            The research workflow is designed for recurring monthly assessments, making it possible
            to track how dataset accessibility signals change over time.
          </p>
        </header>
      </main>
    </div>
  );
}

export default About;
