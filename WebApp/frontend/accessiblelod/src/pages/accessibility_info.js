import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base_url } from '../api';
import axios from 'axios';
import RadarChart from '../components/radar_chart';
import GaugeChart from '../components/gauge_chart';
import { Row, Col, Table } from 'react-bootstrap';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import { accessibilityTables } from '../data/accessibility_tables';
import { getAccessibilityMetrics } from '../data/accessibility_metrics';

export const scoreNumber = value => {
    if (value == null || String(value).trim() === '') return null;
    const number = Number(String(value).replace(',', '.'));
    return Number.isFinite(number) ? number : null;
};

function FairnessInfo(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const dataset_id = queryParams.get('dataset_id');
    const [fairness_data, setFairnessData] = useState({});
    const [dataset_metadata, setDatasetMetadata] = useState(null);
    const [showDownloads, setShowDownloads] = useState(false);
    const [scoresLoading, setScoresLoading] = useState(true);
    const [metadataLoading, setMetadataLoading] = useState(true);
    const [scoresError, setScoresError] = useState(null);
    const [metadataError, setMetadataError] = useState(null);
    // Filter and search for accessibility table
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setFairnessData({});
        setDatasetMetadata(null);
        setScoresError(null);
        setMetadataError(null);
        setScoresLoading(true);
        setMetadataLoading(true);
        setShowDownloads(false);
        if (!dataset_id) {
            setScoresError('No dataset selected. Open a dataset from the cloud or search page.');
            setScoresLoading(false);
            setMetadataLoading(false);
            return () => { active = false; controller.abort(); };
        }
        const encodedId = encodeURIComponent(dataset_id);
        const load = async (endpoint, setData, setError, setLoading, message) => {
            try {
                const response = await axios.get(`${base_url}/AccessibleLOD_data/${endpoint}/${encodedId}`, { signal: controller.signal });
                if (!response.data || typeof response.data !== 'object' || Array.isArray(response.data)) throw new Error('Invalid dataset response');
                if (active) setData(response.data);
            } catch (error) {
                if (active) setError(message);
            } finally {
                if (active) setLoading(false);
            }
        };
        load('accessibility_data', setFairnessData, setScoresError, setScoresLoading, 'Accessibility scores are unavailable for this dataset.');
        load('dataset_metadata', setDatasetMetadata, setMetadataError, setMetadataLoading, 'Dataset information is unavailable.');
        return () => { active = false; controller.abort(); };
    }, [dataset_id]);

    const overallRaw = scoreNumber(fairness_data.overall_score_with_special ?? fairness_data.sum_overall);
    const overallScore = overallRaw == null ? null : Math.max(0, Math.min(1, overallRaw / 6));
    const f_chart_categories = ['Operable', 'Understandable', 'Robust', 'Perceivable'];
    const f_values = f_chart_categories.map(category => scoreNumber(
        fairness_data[`${category.toLowerCase()}_score`] ?? fairness_data[category.toLowerCase()]
    ));
    const radarReady = f_values.some(value => value != null);

    const getScoreColor = (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || value === '' || value === null) return 'text-muted';
        if (numValue === 1) return 'text-success fw-bold';
        if (numValue === 0) return 'text-danger fw-bold';
        return 'text-warning fw-bold';
    };

    const getScoreBadge = (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || value === '' || value === null) return 'secondary';
        if (numValue === 1) return 'success';
        if (numValue === 0) return 'danger';
        return 'warning';
    };

    const renderValue = (value) => {
        if (value === '' || value === null || value === undefined) {
            return <span className="text-muted fst-italic">N/A</span>;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            return <span className={getScoreColor(value)}>{numValue.toFixed(4)}</span>;
        }
        return <span>{value}</span>;
    };

    const accessibilityMetrics = getAccessibilityMetrics(fairness_data)
        .filter(metric => {
            const matchesSearch = metric.label.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || metric.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

    const categories = ['all', ...accessibilityTables.flatMap(table => table.groups.map(group => group.name))];

    return (
        <>
        <div className="container-fluid mt-3 px-4">
            <Navbar />
        </div>
            <div className="container mt-3">
                <div className="text-center mb-4">
                {dataset_metadata?.keywords?.includes("ontology") ? (
                    <>
                    <h1 className="d-inline mb-4">{dataset_metadata?.title || dataset_id || 'Dataset'}</h1>
                    <span className="badge bg-warning text-dark d-inline ms-2">Ontology</span>
                    </>
                ) : (
                    <>
                    <h1 className="d-inline mb-4">{dataset_metadata?.title || dataset_id || 'Dataset'}</h1>
                    <span className="badge bg-secondary d-inline ms-2">Dataset</span>
                    </>
                )}
                </div>

                {dataset_metadata?.description ? (
                    <p className="text-justify mb-5">{typeof dataset_metadata.description === 'string' ? dataset_metadata.description : dataset_metadata.description.en || 'No description available.'}</p>
                ) : (
                    <p className="text-center mb-5">{metadataLoading ? 'Loading dataset information…' : 'No description available.'}</p>
                )}

            {metadataError && <p role="alert" className="text-center">{metadataError}</p>}
            {dataset_metadata && (
                <div className="card shadow-sm p-4 mb-5">
                    <h5 className="mb-3">Dataset Information</h5>
                    <Row>
                        {dataset_metadata.website && (
                            <Col md={6} className="mb-3">
                                <strong>Website: </strong>
                                <a href={dataset_metadata.website} target="_blank" rel="noopener noreferrer">
                                    {dataset_metadata.website}
                                </a>
                            </Col>
                        )}
                        {dataset_metadata.license ? (
                            <Col md={6} className="mb-3">
                                <strong>License: </strong>{dataset_metadata.license}
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>License: </strong>Not specified
                            </Col>
                        )}
                        {dataset_metadata.contact_point?.email || dataset_metadata.contact_point?.name ? (
                            <Col md={6} className="mb-3">
                                <strong>Contact point</strong> <br />
                                <strong>email: </strong>{dataset_metadata.contact_point?.email} <br />
                                <strong>name: </strong>{dataset_metadata.contact_point?.name}
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>Contact point not specified</strong>
                            </Col>
                        )}
                        {dataset_metadata.sparql?.[0] ? (
                            <Col md={6} className="mb-3">
                                <strong>SPARQL Endpoint: </strong>
                                <a href={dataset_metadata.sparql?.[0].access_url} target="_blank" rel="noopener noreferrer">
                                    {dataset_metadata.sparql?.[0].access_url}
                                </a>
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>SPARQL Endpoint: </strong>Not specified
                            </Col>
                        )}
                        {(dataset_metadata?.other_download?.length > 0 || dataset_metadata?.full_download?.length > 0) && (
                             <Col md={6} className="mb-3">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowDownloads(!showDownloads)}
                                >
                                    {showDownloads ? 'Hide Downloadable Resources' : 'Show Downloadable Resources'}
                                </button>
                            </Col>
                        )}
                        {showDownloads && (
                            <div className="card shadow-sm p-4 mb-5">
                                <h5 className="mb-3">Downloadable Resources</h5>
                                {[...(dataset_metadata.full_download || []), ...(dataset_metadata.other_download || [])].map((item, index) => (
                                    <div key={index} className="mb-3">
                                        <p className="mb-1">
                                            <strong>{item.title || "Untitled resource"}</strong>
                                        </p>
                                        <a href={item.access_url || item.download_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                            {item.access_url || item.download_url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Row>
                </div>
            )}

                {!scoresLoading && (overallScore != null || radarReady) ? (
                    <Row className="g-4">
                    {overallScore != null && <Col md={6} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center">Accessibility</h5>
                        <GaugeChart label="Overall Score" value={overallScore} />
                        </div>
                    </Col>}

                    {radarReady && <Col md={6} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center">Accessibility</h5>
                        <RadarChart
                            title={''}
                            categories={f_chart_categories}
                            seriesData={[{ name: fairness_data['KG'], data: f_values }]}
                            height={340}
                        />
                        </div>
                    </Col>}
                    </Row>
                ) : (
                    <p className="text-center" role={scoresError ? 'alert' : 'status'}>{scoresLoading ? 'Loading accessibility data…' : scoresError || 'Accessibility scores are unavailable for this dataset.'}</p>
                )}


                <div className="card shadow-sm p-4 mb-5 mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Accessibility Dimensions</h4>
                        <span className="badge bg-info text-dark">
                            {accessibilityMetrics.length} dimensions
                        </span>
                    </div>


                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search metrics..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={6}>
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </Col>
                    </Row>


                    <div className="table-responsive">
                        <Table hover bordered className="mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '35%' }}>Dimension</th>
                                    <th style={{ width: '25%' }}>Category</th>
                                    <th style={{ width: '20%' }} className="text-center">Value</th>
                                    <th style={{ width: '15%' }} className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessibilityMetrics.length > 0 ? (
                                    accessibilityMetrics.map((metric) => (
                                        <tr key={metric.key} className="hover-highlight">
                                            <td>
                                                <strong>{metric.label}</strong>

                                            </td>
                                            <td>
                                                <span className={`badge bg-${
                                                    metric.category === 'Perceivable' ? 'info' :
                                                    metric.category === 'Operable' ? 'primary' :
                                                    metric.category === 'Understandable' ? 'teal' :
                                                    metric.category === 'Robust' ? 'indigo' :
                                                    metric.category === 'Accessibility for Blind or Visually Impaired Users' ? 'orange' :
                                                    metric.category === 'Accessibility for Deaf or Hard-of-hearing Users' ? 'pink' :
                                                    metric.category === 'Overall Scores' ? 'purple' :
                                                    'secondary'
                                                } text-white`}>
                                                    {metric.category}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {renderValue(metric.value)}
                                            </td>
                                            <td className="text-center">
                                                {metric.value !== '' && metric.value !== null && !isNaN(parseFloat(metric.value)) ? (
                                                    <span className={`badge bg-${getScoreBadge(metric.value)}`}>
                                                        {parseFloat(metric.value) === 1 ? '✓ Good' :
                                                         parseFloat(metric.value) === 0 ? '✗ Poor' :
                                                         '⚠ Moderate'}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-4">
                                            No metrics found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>


                    <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="mb-3">Score Legend:</h6>
                        <Row>
                            <Col md={4}>
                                <span className="badge bg-success me-2">✓ Good</span>
                                <small>Score = 1</small>
                            </Col>
                            <Col md={4}>
                                <span className="badge bg-warning me-2">⚠ Moderate</span>
                                <small>All other scores</small>
                            </Col>
                            <Col md={4}>
                                <span className="badge bg-danger me-2">✗ Poor</span>
                                <small>Score = 0</small>
                            </Col>
                        </Row>
                    </div>
                </div>


            </div>
            <Footer />


            <style>{`
                .hover-highlight:hover {
                    background-color: #f8f9fa;
                    transition: background-color 0.2s ease;
                }
                .font-monospace {
                    font-family: 'Courier New', monospace;
                }
                .bg-teal {
                    background-color: #20c997 !important;
                }
                .bg-indigo {
                    background-color: #6610f2 !important;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
                .bg-orange {
                    background-color: #fd7e14 !important;
                }
                .bg-pink {
                    background-color: #e83e8c !important;
                }

            `}</style>
        </>
      );
}

export default FairnessInfo;
