// Regression tests for default exercise selection in the FitCore catalog.
// Uses only Node.js standard modules; does not start Spring Boot or PostgreSQL.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const frontendPath = path.resolve(__dirname, '../../main/resources/static/fitcore-lab/app.js');
const source = fs.readFileSync(frontendPath, 'utf8');

function sourceSection(start, next) {
    const from = source.indexOf(start);
    const to = source.indexOf(next, from + start.length);
    assert.ok(from >= 0 && to > from, `Cannot find ${start} in app.js`);
    return source.slice(from, to);
}

// Exercise the actual application functions with a tiny DOM/API-free context.
const functions = [
    sourceSection('function orderedVariantsForExercise(', 'function defaultVariantForExercise('),
    sourceSection('function defaultVariantForExercise(', 'function resolveConfiguredVariant('),
    sourceSection('function configurationFromVariant(', 'async function removePlanExercise('),
    sourceSection('async function selectExercise(', 'function resolveVariantForExercise(')
].join('\n');

async function runSelection(variants) {
    const context = {
        state: {
            exercises: [{code: 'benchPress', name: 'Press de banca'}],
            variants,
            selectedExercise: null,
            variantConfiguration: null,
            activations: []
        },
        variantConfigFields: [
            {key: 'equipment'},
            {key: 'benchAngle'},
            {key: 'gripWidth'}
        ],
        renderCatalog: () => {},
        previewConfiguredVariant: async () => {}
    };
    vm.createContext(context);
    vm.runInContext(functions, context, {filename: 'app.js selection functions'});
    await vm.runInContext('selectExercise("benchPress")', context);
    return context.state.variantConfiguration;
}

const variant = (code, defaultVariant = false) => ({
    code,
    exerciseCode: 'benchPress',
    defaultVariant,
    equipment: 'BARBELL',
    benchAngle: 'FLAT',
    gripWidth: 'MEDIUM'
});

test('catalog selects the preferred variant, not the alphabetical first variant', async () => {
    const result = await runSelection([
        variant('aaaAlternateVariant'),
        variant('zzzPreferredVariant', true)
    ]);
    assert.equal(result.variantCode, 'zzzPreferredVariant');
    assert.equal(result.equipment, 'BARBELL');
    assert.equal(result.benchAngle, 'FLAT');
});

test('catalog selection keeps its legacy fallback when no default is flagged', async () => {
    const result = await runSelection([
        variant('zzzVariant'),
        variant('aaaVariant')
    ]);
    assert.equal(result.variantCode, 'aaaVariant');
});
