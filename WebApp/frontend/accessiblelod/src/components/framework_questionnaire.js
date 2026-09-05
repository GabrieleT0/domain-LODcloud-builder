import { FRAMEWORK_QUESTIONNAIRE_URL } from '../data/framework_questionnaire';
import questionnaireQr from '../img/framework-questionnaire-qr.svg';

function FrameworkQuestionnaire() {
  return (
    <aside
      className="border rounded p-4 mb-4 d-flex flex-column flex-sm-row align-items-center gap-4"
      aria-labelledby="framework-questionnaire-title"
    >
      <div className="flex-grow-1">
        <h2 id="framework-questionnaire-title" className="h4">Help evaluate the accessibility framework</h2>
        <p>Share your feedback on the framework through our questionnaire.</p>
        <a
          className="btn btn-outline-dark"
          href={FRAMEWORK_QUESTIONNAIRE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the questionnaire
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
      <figure className="text-center flex-shrink-0 mb-0">
        <a href={FRAMEWORK_QUESTIONNAIRE_URL} target="_blank" rel="noopener noreferrer">
          <img
            src={questionnaireQr}
            width="180"
            height="180"
            alt="QR code to open the framework evaluation questionnaire"
            className="img-fluid"
          />
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        <figcaption className="small text-secondary mt-1">Scan to open the questionnaire</figcaption>
      </figure>
    </aside>
  );
}

export default FrameworkQuestionnaire;
