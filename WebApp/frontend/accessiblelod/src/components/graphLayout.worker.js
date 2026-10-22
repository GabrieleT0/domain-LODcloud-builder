/* global globalThis */
import { createGraphLayout } from './graphLayout';
import positions from '../data/cloud_positions.json';

// Keep the force simulation off the UI thread.
globalThis.onmessage = event => {
    try {
        globalThis.postMessage({ layout: createGraphLayout(event.data, positions) });
    } catch (error) {
        globalThis.postMessage({ error: error.message });
    }
};
