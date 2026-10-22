import fs from 'node:fs';
import { createGraphLayout, topologyKey } from '../src/components/graphLayout.js';
const source = new URL('../../../backend/AccessibleLOD_data.json', import.meta.url);
const destination = new URL('../src/data/cloud_positions.json', import.meta.url);
// Frontend-only Docker builds use the committed snapshot.
if (fs.existsSync(source)) {
    const items = JSON.parse(fs.readFileSync(source, 'utf8'));
    const ids = new Set(items.map(node => node.identifier));
    const data = {
        nodes: items.map(node => ({ id: node.identifier })),
        links: items.flatMap(node => (node.links || []).filter(link => ids.has(link.target)).map(link => ({ source: node.identifier, target: link.target }))),
    };
    const topology = topologyKey(data);
    const existing = fs.existsSync(destination) ? JSON.parse(fs.readFileSync(destination, 'utf8')) : null;
    if (existing?.topology !== topology) {
        const layout = createGraphLayout(data);
        const positions = layout.nodes.filter(node => !node.isolated).map(node => [node.id, node.x, node.y]);
        fs.writeFileSync(destination, `${JSON.stringify({ topology, positions })}\n`);
        console.log(`Prepared positions for ${positions.length} connected datasets`);
    } else console.log('Cloud positions are up to date');
} else if (!fs.existsSync(destination)) throw new Error('No cloud dataset or packaged layout available');
