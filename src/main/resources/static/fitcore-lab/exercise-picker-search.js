// FitCore: un resultado por familia; una búsqueda concreta preselecciona
// una variante REAL, sin duplicar tarjetas por agarre, material o apoyo.
// Los identificadores de ejercicios y variantes nunca se usan como términos.
(function (root) {
    'use strict';

    const equipmentAliases = Object.freeze({
        BARBELL: 'barra olimpica',
        EZ_BAR: 'barra z ez',
        DUMBBELL: 'mancuerna mancuernas',
        SMITH_MACHINE: 'smith multipower maquina guiada',
        MACHINE_SELECTORISED: 'maquina placas selectorizada',
        MACHINE_PLATE_LOADED: 'maquina discos',
        CABLE: 'polea cable',
        BODYWEIGHT: 'peso corporal sin carga',
        BAND: 'banda elastica',
        KETTLEBELL: 'pesa rusa kettlebell',
        TRAP_BAR: 'barra hexagonal trap bar',
        WEIGHT_PLATE: 'disco',
        BENCH: 'banco',
        AB_WHEEL: 'rueda abdominal',
        WRIST_ROLLER: 'rodillo muneca'
    });

    const gripAliases = Object.freeze({
        PRONATED: 'prono prona pronos pronas pronado pronadas',
        SUPINATED: 'supino supina supinos supinas supinado supinadas',
        NEUTRAL: 'neutro neutra neutros neutras paralelo',
        SEMI_NEUTRAL: 'semineutro semineutra',
        SEMI_PRONATED: 'semiprono semiprona',
        SEMI_SUPINATED: 'semisupino semisupina'
    });

    // Solo nombres públicos; el cambio de nombre visible no altera códigos.
    const familyTitles = Object.freeze({
        tricepsPushdown: 'Extensión de tríceps',
        overheadTricepsExtension: 'Extensión de tríceps sobre la cabeza',
        lyingTricepsExtension: 'Extensión de tríceps tumbado',
        pullUp: 'Dominadas',
        scapularPullUp: 'Dominadas escapulares'
    });

    const familyAliases = Object.freeze({
        tricepsPushdown: 'jalon triceps pushdown extension triceps polea',
        overheadTricepsExtension: 'extension triceps cabeza overhead',
        lyingTricepsExtension: 'extension triceps tumbado press frances',
        pullUp: 'dominadas chin up pull up',
        chestFly: 'aperturas pecho',
        romanianDeadlift: 'peso muerto rumano',
        forearmRotation: 'pronacion supinacion antebrazo'
    });

    function normalize(value) {
        return String(value ?? '').normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('es')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function words(value) {
        return normalize(value).split(/\s+/).filter(Boolean);
    }

    // Coincidencia en inicio de PALABRA: press nunca coincide con prensa.
    function matches(text, tokens) {
        const available = words(text);
        return tokens.every(token => {
            const term = token.startsWith('inclin') ? 'inclina' : token;
            return available.some(word => word.startsWith(term));
        });
    }

    function titleFor(exercise) {
        return familyTitles[exercise.code] || exercise.name;
    }

    // Compatibilidad con otros consumidores; una sola agrupación por familia.
    function groupKey(exercise) {
        return exercise.code;
    }

    function preferred(variants) {
        const score = variant =>
            ((variant.isDefault || variant.defaultVariant || variant.default) ? 1000 : 0) +
            (variant.practicality === 'COMMON' ? 30 : 0) +
            (variant.gripWidth === 'MEDIUM' ? 12 : 0) +
            (variant.gripType === 'PRONATED' ? 3 : 0) +
            (variant.equipment === 'BARBELL' ? 2 : 0);
        return variants.slice().sort((a, b) =>
            score(b) - score(a) ||
            String(a.name || '').localeCompare(String(b.name || ''), 'es') ||
            String(a.code).localeCompare(String(b.code), 'en')
        )[0] || null;
    }

    function variantSearchText(exercise, variant, friendly) {
        const fields = [
            variant.name,
            equipmentAliases[variant.equipment] || '',
            friendly(variant.equipment),
            gripAliases[variant.gripType] || '',
            friendly(variant.gripType),
            friendly(variant.gripWidth),
            friendly(variant.attachmentType),
            friendly(variant.benchAngle),
            friendly(variant.bodyPosition),
            friendly(variant.supportType),
            friendly(variant.stanceType),
            friendly(variant.trajectory),
            friendly(variant.laterality)
        ];
        // Esta familia contiene dos movimientos opuestos: "pronación" no debe
        // coincidir con una variante de supinación solo porque aparezca en
        // el nombre genérico de la familia.
        if (exercise.code !== 'forearmRotation') {
            fields.push(exercise.name, titleFor(exercise));
        }
        return fields.join(' ');
    }

    function search({
        exercises = [], variants = [], query = '', equipment = '',
        muscle = '', friendly = value => String(value ?? '')
    }) {
        const ignored = new Set(['de','del','la','las','el','los','en','con','y',
                                 'para','al','a','por','sobre']);
        const tokens = words(query).filter(token => !ignored.has(token));
        const byExercise = new Map();
        variants.forEach(variant => {
            if (variant.active === false) return;
            if (!byExercise.has(variant.exerciseCode)) byExercise.set(variant.exerciseCode, []);
            byExercise.get(variant.exerciseCode).push(variant);
        });
        const results = [];

        exercises.forEach(exercise => {
            if (muscle && exercise.mainMuscleGroup !== muscle) return;
            const all = byExercise.get(exercise.code) || [];
            const filtered = all.filter(variant => !equipment || variant.equipment === equipment);
            if (!filtered.length) return;

            // "Press francés" es un alias válido de extensión tumbada.
            // La consulta genérica "press" también debe poder encontrarlo;
            // los presses cuyo nombre oficial incluye "press" irán primero.
            const matched = tokens.length
                ? filtered.filter(variant =>
                    matches(variantSearchText(exercise, variant, friendly), tokens))
                : filtered;
            const fallback = tokens.length && !matched.length &&
                matches([exercise.name, titleFor(exercise),
                         familyAliases[exercise.code] || ''].join(' '), tokens);
            if (!matched.length && !fallback) return;

            const relevant = matched.length ? matched : filtered;
            const chosen = preferred(relevant);
            const specific = tokens.length > 0 && matched.length > 0 &&
                matched.length < filtered.length;

            results.push({
                exercise,
                kind: 'base',
                title: titleFor(exercise),
                variant: chosen,
                // Configurar siempre recibe TODAS las opciones de la familia,
                // incluso si la consulta o el filtro solo encontró una.
                variantCodes: all.map(variant => variant.code),
                matchingCodes: relevant.map(variant => variant.code),
                detail: specific
                    ? 'Coincidencia: ' + chosen.name
                    : all.length > 1
                        ? all.length + ' configuraciones'
                        : friendly(exercise.mainMuscleGroup)
            });
        });
        if (tokens.length === 1 && tokens[0] === 'press') {
            results.sort((a, b) => {
                const named = item => matches([item.exercise.name,
                    titleFor(item.exercise)].join(' '), ['press']) ? 1 : 0;
                return named(b) - named(a);
            });
        }
        return results;
    }

    const api = Object.freeze({ normalize, matches, search, groupKey, preferred, titleFor });
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.FitCoreExerciseSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
