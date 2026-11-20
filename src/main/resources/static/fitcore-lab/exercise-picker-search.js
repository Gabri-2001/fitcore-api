// FitCore: búsqueda pública por nombres y agrupación de modalidades.
// No modifica ni interpreta IDs/códigos internos para determinar coincidencias.
(function (root) {
    'use strict';

    const equipmentAliases = Object.freeze({
        SMITH_MACHINE: 'smith multipower maquina guiada',
        MACHINE_SELECTORISED: 'maquina placas selectorizada',
        MACHINE_PLATE_LOADED: 'maquina discos',
        DUMBBELL: 'mancuerna mancuernas',
        BARBELL: 'barra',
        CABLE: 'polea cable',
        BODYWEIGHT: 'peso corporal'
    });

    function normalize(value) {
        return String(value ?? '').normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('es')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    // Prefijos de PALABRA, no subcadenas de código: "press" !== "prensa".
    function matches(text, tokens) {
        const words = normalize(text).split(/\s+/).filter(Boolean);
        return tokens.every(token => words.some(word => word.startsWith(token)));
    }

    function groupKey(exercise, variant) {
        const family = exercise.code;
        // Una modalidad de press por plataforma y ángulo. Agarre y anchura
        // se mantienen como ajustes, no como resultados repetidos.
        if (family === 'benchPress' || family === 'machineChestPress') {
            const platform = variant.equipment === 'SMITH_MACHINE' ? 'SMITH'
                : ['BARBELL', 'DUMBBELL'].includes(variant.equipment) ? 'BANCO'
                    : ['MACHINE_PLATE_LOADED', 'MACHINE_SELECTORISED'].includes(variant.equipment)
                        ? 'MAQUINA' : (variant.equipment || 'OTRO');
            return `${family}|${variant.benchAngle || 'NO_ANGLE'}|${platform}`;
        }
        // El tipo de agarre sí identifica una modalidad de dominada / jalón,
        // pero la anchura no genera una tarjeta adicional.
        if (family === 'pullUp' || family === 'latPulldown') {
            return `${family}|${variant.gripType || 'OTRO'}`;
        }
        // Aperturas: diferencia útil de posición/recorrido y material.
        if (family === 'chestFly') {
            return `${family}|${variant.equipment || 'OTRO'}|${variant.benchAngle || 'OTRO'}|${variant.trajectory || 'OTRO'}`;
        }
        // En otras familias las diferencias de agarre, apoyo y laterality
        // se deciden mediante el configurador existente, por ahora.
        return family;
    }

    function preferred(variants) {
        const ordered = variants.slice().sort((a, b) => {
            const score = variant =>
                (variant.isDefault || variant.defaultVariant || variant.default ? 100 : 0) +
                (variant.practicality === 'COMMON' ? 12 : 0) +
                (variant.equipment === 'BARBELL' ? 5 : 0) +
                (variant.gripWidth === 'MEDIUM' ? 2 : 0);
            return score(b) - score(a) || String(a.code).localeCompare(String(b.code), 'en');
        });
        return ordered[0] || null;
    }

    function search({exercises = [], variants = [], query = '', equipment = '', muscle = '', friendly = v => String(v ?? '')}) {
        const tokens = normalize(query).split(/\s+/).filter(Boolean);
        const byExercise = new Map();
        variants.forEach(variant => {
            if (variant.active === false) return;
            if (!byExercise.has(variant.exerciseCode)) byExercise.set(variant.exerciseCode, []);
            byExercise.get(variant.exerciseCode).push(variant);
        });
        const results = [];
        exercises.forEach(exercise => {
            if (muscle && exercise.mainMuscleGroup !== muscle) return;
            const available = (byExercise.get(exercise.code) || [])
                .filter(variant => !equipment || variant.equipment === equipment);
            if (!available.length) return;

            // Los nombres del ejercicio base deciden las búsquedas generales.
            // No usamos exercise.description ni variant.code: contienen vocablos
            // accidentales ('press' en 'legPress') y referencias técnicas.
            if (!tokens.length || matches(exercise.name, tokens)) {
                results.push({
                    exercise,
                    variant: equipment ? preferred(available) : null,
                    variantCodes: available.map(variant => variant.code),
                    kind: 'base'
                });
                return;
            }

            const hits = available.filter(variant => matches([
                exercise.name,
                variant.name,
                friendly(variant.equipment),
                equipmentAliases[variant.equipment] || '',
                friendly(variant.benchAngle),
                friendly(variant.gripType),
                friendly(variant.gripWidth),
                friendly(variant.attachmentType)
            ].join(' '), tokens));
            const groups = new Map();
            hits.forEach(variant => {
                const key = groupKey(exercise, variant);
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(variant);
            });
            groups.forEach(group => {
                results.push({
                    exercise,
                    variant: preferred(group),
                    variantCodes: group.map(variant => variant.code),
                    kind: 'modality'
                });
            });
        });
        return results;
    }

    const api = Object.freeze({normalize, matches, search, groupKey, preferred});
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.FitCoreExerciseSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
