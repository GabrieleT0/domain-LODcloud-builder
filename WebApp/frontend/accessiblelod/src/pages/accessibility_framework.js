import Navbar from '../components/navbar';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ScoringFormula from '../components/scoring_formula';
import FrameworkQuestionnaire from '../components/framework_questionnaire';
import { accessibilityTables } from '../data/accessibility_tables';
import './accessibility_framework.css';

const rowId = (name) => `parameter-${name.toLowerCase().replace(/\W+/g, '-')}`;

function jumpTo(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }
}

function AccessibilityFramework() {
  return (
    <div className="container-fluid mt-3 px-4">
      <Navbar />
      <main className="accessibility-framework mx-auto pb-5">
        <header className="accessibility-framework-intro p-4 mb-4">
          <h1>The Human-Accessibility Framework</h1>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-dark" onClick={() => jumpTo('table-1')}>
              Accessibility for All
            </button>
            <button type="button" className="btn btn-outline-dark" onClick={() => jumpTo('table-2')}>
              Special Need groups
            </button>
          </div>
        </header>

        <FrameworkQuestionnaire />

        <aside className="mb-4" aria-label="How to read the tables">
          <p className="mb-2">
            <strong>Level:</strong> M = metadata; D = data. In the formulas,
            # means “number of”.
          </p>
        </aside>

        {accessibilityTables.map((table) => {
          const hasRequirements = table.id === 'table-2';
          return (
            <section key={table.id} className="mb-5" aria-labelledby={table.id}>
              <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-2">
                <h2 id={table.id} tabIndex={-1}>{table.title}</h2>
              </div>
              <div className="table-responsive framework-table-container" role="region" aria-labelledby={table.id} tabIndex={0}>
                <table className="table table-bordered table-hover align-middle mb-0">
                  <caption className="caption-top px-3">{table.caption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Dimension</th>
                      <th scope="col">Description</th>
                      <th scope="col">Level</th>
                      <th scope="col">{hasRequirements ? 'Computational method' : 'Scoring function'}</th>
                      {hasRequirements && <th scope="col">Requirements</th>}
                    </tr>
                  </thead>
                  {table.groups.map((group) => (
                    <tbody key={group.name}>
                      <tr className="framework-table-group">
                        <th scope="rowgroup" colSpan={hasRequirements ? 5 : 4}>{group.name}</th>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.name}>
                          <th scope="row" id={rowId(row.name)} tabIndex={-1}>{row.name}</th>
                          <td>{row.description}</td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              trigger={['hover', 'focus']}
                              overlay={
                                <Tooltip id={`${rowId(row.name)}-level`}>
                                  {row.level === 'M' ? 'Metadata' : 'Data'}
                                </Tooltip>
                              }
                            >
                              <button
                                type="button"
                                className="framework-level-help"
                                aria-label={`${row.level}: ${row.level === 'M' ? 'Metadata' : 'Data'}`}
                              >
                                {row.level}
                              </button>
                            </OverlayTrigger>
                          </td>
                          <td className="framework-table-formula"><ScoringFormula formula={row.scoring} /></td>
                          {hasRequirements && (
                            <td>
                                {row.requirement}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

export default AccessibilityFramework;
