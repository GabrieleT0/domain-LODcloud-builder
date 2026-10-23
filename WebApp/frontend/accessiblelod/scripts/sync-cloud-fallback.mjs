import fs from 'node:fs';
import { csvParse } from 'd3';

const datasetsPath = new URL('../../../backend/AccessibleLOD_data.json', import.meta.url);
const scoresPath = new URL('../../../backend/data/accessibleLOD_scores.csv', import.meta.url);
const destination = new URL('../src/data/cloud_fallback.json', import.meta.url);
const scoresDestination = new URL('../src/data/accessibility_scores.json', import.meta.url);

// The frontend Docker build only receives this directory, so keep the generated
// snapshot checked in and refresh it during local builds when backend data exists.
if (fs.existsSync(datasetsPath) && fs.existsSync(scoresPath)) {
    const datasets = JSON.parse(fs.readFileSync(datasetsPath, 'utf8'));
    const scoreRows = csvParse(fs.readFileSync(scoresPath, 'utf8'));
    const scores = new Map(scoreRows.map(row => [
        row.KG_ID || row.KG,
        row.overall_score_with_special?.trim() ? Number(row.overall_score_with_special) : null,
    ]));
    const ids = new Set(datasets.map(item => item.identifier));
    const label = value => ({
        government: 'Government', cross_domain: 'Cross Domain', life_sciences: 'Life Sciences',
        publications: 'Publications', geography: 'Geography', user_generated: 'User Generated',
        linguistics: 'Linguistics', social_networking: 'Social Networking', media: 'Media',
    }[value] || value || 'No domain');
    const graph = {
        nodes: datasets.map(item => ({
            id: item.identifier,
            title: item.title,
            category: label(item.domain),
            overall_score_with_special: scores.get(item.identifier) ?? null,
            url: `/#/accessibility_info?dataset_id=${encodeURIComponent(item.identifier)}`,
        })),
        links: datasets.flatMap(item => (item.links || [])
            .filter(link => ids.has(link.target))
            .map(link => ({ source: item.identifier, target: link.target }))),
    };
    fs.writeFileSync(destination, `${JSON.stringify(graph)}\n`);
    fs.writeFileSync(scoresDestination, `${JSON.stringify(Object.fromEntries(scoreRows.map(row => [row.KG_ID || row.KG, row])))}\n`);
    console.log(`Prepared frontend cloud fallback for ${graph.nodes.length} datasets`);
} else if (!fs.existsSync(destination)) {
    throw new Error('No backend dataset snapshot or packaged cloud fallback available');
}
