import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { csvParse } from 'd3';

const source = new URL('../../../backend/data/accessibleLOD_scores.csv', import.meta.url);
const destination = new URL('../src/data/cloud_scores.json', import.meta.url);
// Docker builds have only the frontend context and use the checked-in snapshot.
if (fs.existsSync(source)) {
    const scores = Object.fromEntries(csvParse(fs.readFileSync(source, 'utf8')).map(row => {
        const value = row.overall_score_with_special?.trim();
        const score = value ? Number(value) : NaN;
        return [row.KG, Number.isFinite(score) ? score : null];
    }));
    fs.writeFileSync(destination, `${JSON.stringify(scores)}\n`);
    console.log(`Synced ${Object.keys(scores).length} cloud scores from ${fileURLToPath(source)}`);
} else if (!fs.existsSync(destination)) {
    throw new Error('No cloud score CSV or packaged score snapshot available');
}
