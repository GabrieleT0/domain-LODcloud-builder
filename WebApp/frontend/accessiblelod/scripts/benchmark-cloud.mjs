import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { createGraphLayout } from '../src/components/graphLayout.js';
const items = JSON.parse(fs.readFileSync(new URL('../../../backend/AccessibleLOD_data.json', import.meta.url)));
const ids = new Set(items.map(node => node.identifier));
const data = { nodes: items.map(node => ({ id: node.identifier, title: node.title })), links: items.flatMap(node => node.links.filter(link => ids.has(link.target)).map(link => ({ source: node.identifier, target: link.target }))) };
const start = performance.now();
const positions = JSON.parse(fs.readFileSync(new URL('../src/data/cloud_positions.json', import.meta.url)));
const layout = createGraphLayout(data, positions);
const elapsed = performance.now() - start;
let overlaps = 0;
for (let i = 0; i < layout.nodes.length; i += 1) {
    const a = layout.nodes[i];
    for (let j = i + 1; j < layout.nodes.length; j += 1) {
        const b = layout.nodes[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius) overlaps += 1;
    }
}
console.log(JSON.stringify({ milliseconds: Math.round(elapsed), nodes: layout.nodes.length, links: layout.links.length, overlaps, width: Math.round(layout.width), height: Math.round(layout.height) }));
if (overlaps) process.exitCode = 1;
