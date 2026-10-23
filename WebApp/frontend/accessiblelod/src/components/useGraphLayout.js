import { useEffect, useState } from 'react';
import { createGraphLayout } from './graphLayout';
import positions from '../data/cloud_positions.json';

const emptyLayout = {
    nodes: [], links: [], width: 850, height: 250, connectedCount: 0, isolatedCount: 0,
    connectedBounds: { x: 0, y: 0, width: 850, height: 250 },
    isolatedBounds: { x: 0, y: 0, width: 850, height: 250 },
};
// Reuse a pending/completed job across StrictMode mounts and visits to the cloud.
let cachedKey;
let cachedJob;
let activeWorker;
let cancelActiveJob;
export function requestLayout(data) {
    const key = JSON.stringify(data);
    if (key === cachedKey && cachedJob) return cachedJob;
    cancelActiveJob?.();
    cachedKey = key;
    const job = new Promise((resolve, reject) => {
        // Resolve split chunks from the worker URL, including on project Pages.
        // The app's relative public path otherwise repeats static/js/ in workers.
        let worker;
        const fallback = () => {
            try { resolve(createGraphLayout(data, positions)); }
            catch (error) { reject(error); }
        };
        try {
            worker = new Worker(
                /* webpackEntryOptions: { publicPath: "auto" } */
                new URL('./graphLayout.worker.js', import.meta.url),
            );
        } catch (error) {
            fallback();
            return;
        }
        activeWorker = worker;
        const finish = () => {
            worker.terminate();
            if (activeWorker === worker) { activeWorker = null; cancelActiveJob = null; }
        };
        cancelActiveJob = () => {
            finish();
            reject(new Error('Layout request was replaced'));
        };
        worker.onmessage = event => {
            finish();
            if (event.data.error) fallback();
            else resolve(event.data.layout);
        };
        worker.onerror = () => {
            finish();
            fallback();
        };
        try { worker.postMessage(data); }
        catch (error) { finish(); fallback(); }
    });
    cachedJob = job;
    job.catch(() => {
        if (cachedJob === job) { cachedKey = null; cachedJob = null; }
    });
    return job;
}

export function useGraphLayout(data) {
    const [result, setResult] = useState(null);
    useEffect(() => {
        if (!data.nodes.length) return;
        let cancelled = false;
        requestLayout(data).then(
            layout => { if (!cancelled) setResult({ data, layout }); },
            error => { if (!cancelled) setResult({ data, error: error.message }); },
        );
        return () => { cancelled = true; };
    }, [data]);
    return {
        layout: result?.data === data && result.layout ? result.layout : emptyLayout,
        layoutLoading: data.nodes.length > 0 && result?.data !== data,
        layoutError: result?.data === data ? result.error : null,
    };
}
