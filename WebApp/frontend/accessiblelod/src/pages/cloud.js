import Graph from "../components/Graph";
import { base_url } from '../api';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import cloudScores from '../data/cloud_scores.json';
import cloudFallback from '../data/cloud_fallback.json';

function Cloud(){
    const [data, setData] = useState(cloudFallback);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`${base_url}/AccessibleLOD_data/all_ch_links`, { signal: controller.signal })
            .then(response => {
                if (!response.ok) throw new Error('Unable to load graph');
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) throw new Error('Invalid graph data');
                // A reachable API can still have an empty database. Keep the
                // packaged snapshot visible unless the backend has real data.
                if (data.nodes.length === 0) return;
                setData({
                    ...data,
                    nodes: data.nodes.map(node => ({
                        ...node,
                        // Older backend processes omit this property entirely.
                        overall_score_with_special: Object.prototype.hasOwnProperty.call(node, 'overall_score_with_special')
                            ? node.overall_score_with_special : cloudScores[node.id] ?? null,
                    })),
                });
                setLoading(false);
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    setData(cloudFallback);
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

return (
    <div className="container-fluid mt-3 px-4">
    <Navbar />
    <div className="d-flex flex-column justify-content-center align-items-center my-3">
        <h2 style={{ fontFamily: "'Verdana', serif", color: "#46B9B9" }}>
        <b>AccessibleLOD</b>
        </h2>
        <h3 style={{ fontFamily: "'Verdana', serif", color: "#46B9B9" }}>
        Linked Open Data for All
        </h3>
    </div>
    <Graph data={data} loading={loading} error={error} />
    </div>
)

}

export default Cloud;
