import * as d3 from 'd3';

export const normalizedScore = value => {
    if (value == null || String(value).trim() === '') return null;
    const score = Number(value);
    return Number.isFinite(score) ? Math.max(0, Math.min(1, score / 6)) : null;
};
// More contrast where most scores fall, with AccessibleLOD teal as the middle shade.
const accessibleLodTeal = d3.scaleLinear()
    .domain([0, 0.35, 1])
    .range(['#e9f7f7', '#46b9b9', '#0d5555'])
    .interpolate(d3.interpolateLab)
    .clamp(true);
export const scoreColor = score => score == null ? '#cbd5e1' : accessibleLodTeal(score);

// Include node/link ordering and endpoints: changed topology must get a fresh layout.
export function topologyKey(data) {
    const ids = data.nodes.map(node => node.id);
    const indexes = new Map(ids.map((id, index) => [id, index]));
    const endpoint = value => typeof value === 'object' ? value.id : value;
    return JSON.stringify([ids, data.links.map(link => [indexes.get(endpoint(link.source)) ?? endpoint(link.source), indexes.get(endpoint(link.target)) ?? endpoint(link.target)])]);
}

// D3 mutates positions and endpoints, so keep the original API response intact.
export function createGraphLayout(data, precomputed = null) {
    const nodes = data.nodes.map(node => ({ ...node, incoming: 0, score: normalizedScore(node.overall_score_with_special) }));
    const byId = new Map(nodes.map(node => [node.id, node]));
    const endpoint = value => typeof value === 'object' ? value.id : value;
    const links = data.links.map(link => ({ source: endpoint(link.source), target: endpoint(link.target) }))
        .filter(link => byId.has(link.source) && byId.has(link.target));
    const linkedIds = new Set();
    links.forEach(link => {
        linkedIds.add(link.source);
        linkedIds.add(link.target);
        byId.get(link.target).incoming += 1;
    });
    const radius = d3.scaleSqrt().domain([0, d3.max(nodes, node => node.incoming) || 1]).range([20, 57]);
    nodes.forEach(node => { node.radius = radius(node.incoming); });
    const connected = nodes.filter(node => linkedIds.has(node.id));
    const isolated = nodes.filter(node => !linkedIds.has(node.id));
    nodes.forEach(node => { node.isolated = !linkedIds.has(node.id); });
    const positions = precomputed?.topology === topologyKey(data) ? precomputed.positions : null;
    if (positions) {
        const byPositionId = new Map(positions.map(([id, x, y]) => [id, { x, y }]));
        connected.forEach(node => Object.assign(node, byPositionId.get(node.id)));
        // Link endpoints must reference the new scored nodes, including on the cached path.
        links.forEach(link => { link.source = byId.get(link.source); link.target = byId.get(link.target); });
    } else {
        const simulation = d3.forceSimulation(connected).stop()
            .force('link', d3.forceLink(links).id(node => node.id).distance(link => link.source.radius + link.target.radius + 3).strength(0.035))
            .force('charge', d3.forceManyBody().strength(-2))
            .force('x', d3.forceX(0).strength(0.08))
            .force('y', d3.forceY(0).strength(2))
            .force('collision', d3.forceCollide(node => node.radius + 1.5).iterations(5));
        for (let tick = 0; tick < 300; tick += 1) simulation.tick();
        // Release the centering forces and settle collisions without spreading the cloud.
        simulation.force('link', null).force('charge', null).force('x', null).force('y', null).alpha(0.1);
        for (let tick = 0; tick < 100; tick += 1) simulation.tick();
    }
    const padding = 24;
    const left = d3.min(connected, node => node.x - node.radius) ?? 0;
    const top = d3.min(connected, node => node.y - node.radius) ?? 0;
    connected.forEach(node => { node.x += padding - left; node.y += padding - top; });
    const connectedWidth = (d3.max(connected, node => node.x + node.radius) ?? 0) + padding;
    const connectedBottom = d3.max(connected, node => node.y + node.radius) ?? 0;
    const width = Math.max(850, connectedWidth, Math.sqrt(isolated.length) * 42);
    const dividerY = connected.length ? connectedBottom + 25 : 25;
    const cols = Math.max(1, Math.floor((width - padding * 2) / 42));
    isolated.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const count = Math.min(cols, isolated.length - row * cols);
        node.x = (width - (count - 1) * 42) / 2 + (index % cols) * 42;
        node.y = dividerY + 60 + row * 42;
    });
    const height = Math.max(250, (d3.max(nodes, node => node.y + node.radius) ?? 0) + padding);
    const connectedBounds = { x: 0, y: 0, width, height: Math.max(100, connectedBottom + padding) };
    const isolatedBounds = { x: 0, y: dividerY, width, height: height - dividerY };
    return { nodes, links, width, height, dividerY, connectedBounds, isolatedBounds,
        connectedCount: connected.length, isolatedCount: isolated.length };
}
