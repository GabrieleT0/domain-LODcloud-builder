import { useState } from 'react';
import axios from 'axios';
import { base_url } from '../api';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import { Link } from 'react-router-dom';
import accessibilityScores from '../data/accessibility_scores.json';

const searchPackagedCsv = (query, selectedFields, page, limit = 10) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = Object.entries(accessibilityScores)
    .filter(([, row]) => !normalizedQuery || selectedFields.some(field => {
      const value = field === 'identifier' ? row.KG_ID || row.KG : row[field];
      return value != null && String(value).toLocaleLowerCase().includes(normalizedQuery);
    }))
    .map(([identifier, row]) => ({ identifier, title: row.title || identifier }));
  const totalPages = Math.ceil(matches.length / limit);
  return {
    results: matches.slice((page - 1) * limit, page * limit),
    totalPages,
    page,
  };
};

function Search() {
  const [name, setName] = useState('');
  const [fields, setFields] = useState({
    title: true,
    description: false,
    identifier: false,
    keywords: false
  });
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (nameQuery, pageQuery = 1) => {
    let selectedFieldArray = Object.keys(fields).filter(f => fields[f]);
    let queryFields;
    if (selectedFieldArray.length === 0 && name.trim() === '') {
      queryFields = ['title', 'description', 'identifier', 'keywords'].join(',');
    } else if (selectedFieldArray.length === 0) {
      queryFields = 'title';
    } else {
      queryFields = selectedFieldArray.join(',');
    }
    const localFields = queryFields.split(',');
    const localResults = searchPackagedCsv(nameQuery, localFields, pageQuery);
    setResults(localResults.results);
    setTotalPages(localResults.totalPages);
    setPage(localResults.page);
    setHasSearched(true);

    try {
      const res = await axios.get(`${base_url}/AccessibleLOD_data/search`, {
        params: {
          q: nameQuery,
          fields: queryFields,
          page: pageQuery,
          limit: 10
        }
      });
      if (res.data.results?.length) {
        setResults(res.data.results);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      }
    } catch (err) {
      // The packaged CSV results are already visible while the backend is
      // unavailable or taking too long to respond.
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(name, 1);
  };

  const handlePageChange = (newPage) => {
    fetchData(name, newPage);
  };

  const handleCheckboxChange = (field) => {
    setFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const generateDatasetLink = (id) => `/accessibility_info?dataset_id=${id}`;

  // **Pagination window**
  const getVisiblePages = () => {
    const delta = 2; // pages before and after current
    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <div className="container-fluid mt-3 px-4">
        <Navbar />
      </div>

      <div className="container mt-3 pb-1 min-vh-100">
        <h3 className="mb-4 mt-4">Search into the AccessibleLOD</h3>

        <form className="mb-4" onSubmit={handleSearch}>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search term"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#46B9B9', border: 'none' }}
            >
              Search
            </button>
          </div>

          <div className="mb-3 d-flex flex-wrap">
            {['title', 'description', 'identifier', 'keywords'].map((f) => (
              <label key={f} className="form-check me-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={fields[f]}
                  onChange={() => handleCheckboxChange(f)}
                />
                {f === 'identifier' ? 'ID' : f.charAt(0).toUpperCase() + f.slice(1)}
              </label>
            ))}
          </div>
        </form>

        {results.length > 0 ? (
          <>
            <ul className="list-group mb-3">
              {results.map((item) => (
              <Link
                key={item.identifier}
                to={generateDatasetLink(item.identifier)}
                className="list-group-item list-group-item-action"
              >
                <strong>{item.title}</strong><br />
                <small className="text-muted">ID: {item.identifier}</small>
              </Link>
              ))}
            </ul>

            {/* Responsive Pagination */}
            <nav>
              <ul className="pagination mb-5 justify-content-center flex-wrap">
                {page > 1 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page - 1)}
                      style={{
                        backgroundColor: '#46B9B9',
                        color: '#fff',
                        borderColor: '#46B9B9',
                        transition: 'background-color 0.3s ease'
                      }}
                    >
                      &laquo;
                    </button>
                  </li>
                )}

                {getVisiblePages().map((p) => (
                  <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(p)}
                      disabled={p === page}
                      style={{
                        backgroundColor: p === page ? '#46B9B9' : '#ffffff',
                        color: p === page ? '#fff' : '#000',
                        borderColor: '#46B9B9',
                        transition: 'background-color 0.3s ease'
                      }}
                    >
                      {p}
                    </button>
                  </li>
                ))}

                {page < totalPages && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page + 1)}
                      style={{
                        backgroundColor: '#46B9B9',
                        color: '#fff',
                        borderColor: '#46B9B9',
                        transition: 'background-color 0.3s ease'
                      }}
                    >
                      &raquo;
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </>
        ) : (
          hasSearched && (
            <div className="alert alert-info">No results found.</div>
          )
        )}
      </div>

      <Footer />
    </>
  );
}

export default Search;
