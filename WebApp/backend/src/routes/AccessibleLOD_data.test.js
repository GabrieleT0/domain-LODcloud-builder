const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const path = require('node:path');
const csv = require('csv-parser');
const router = require('./AccessibleLOD_data');

const handler = router.stack.find(layer => layer.route?.path === '/accessibility_data/:id')
    .route.stack[0].handle;

function requestScores(id) {
    return new Promise((resolve, reject) => {
        const res = {
            headersSent: false,
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(body) {
                assert.equal(this.headersSent, false, 'response must only be sent once');
                this.headersSent = true;
                resolve({ status: this.statusCode, body });
            },
        };
        Promise.resolve(handler({ params: { id } }, res)).catch(reject);
    });
}

test('dataset API returns the complete score row from the current CSV', async () => {
    const input = fs.createReadStream(path.join(__dirname, '../../data/accessibleLOD_scores.csv')).pipe(csv());
    let first;
    for await (const row of input) {
        if (!first) first = row;
    }
    const result = await requestScores(first.KG_ID || first.KG);
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, first);
});

test('dataset API supports both KG_ID and legacy KG headers', async t => {
    for (const header of ['KG_ID', 'KG']) {
        const mock = t.mock.method(fs, 'createReadStream', () =>
            Readable.from([`${header},image_metadata,audio_description_ratio\nexample,0,0.5\n`]));
        const result = await requestScores('example');
        assert.equal(result.status, 200);
        assert.equal(result.body.image_metadata, '0');
        assert.equal(result.body.audio_description_ratio, '0.5');
        mock.mock.restore();
    }
});

test('dataset API returns 404 for an unknown dataset', async t => {
    t.mock.method(fs, 'createReadStream', () => Readable.from(['KG_ID,image\nexample,0\n']));
    const result = await requestScores('unknown');
    assert.equal(result.status, 404);
});
