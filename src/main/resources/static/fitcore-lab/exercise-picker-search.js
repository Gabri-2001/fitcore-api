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
        EZ_BAR: 'barra z barra ez',
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
        return tokens.every(token => words.some(word => word.startsWith(token.startsWith('inclin') ? 'inclina' : token)));
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
            return `${family}|${platform}`;
        }
        // El tipo de agarre sí identifica una modalidad de dominada / jalón,
        // pero la anchura no genera una tarjeta adicional.
        if (family === 'pullUp') {
            return `${family}|${variant.gripType || 'OTRO'}`;
        }
        if (family === 'latPulldown') {
            return `${family}|${variant.laterality === 'UNILATERAL' ? 'UNILATERAL' : 'BILATERAL'}`;
        }
        if (family === 'machineRow' || family === 'seatedCableRow') {
            const mode = family === 'seatedCableRow'
                ? (variant.laterality === 'UNILATERAL' ? 'UNILATERAL' : 'BILATERAL')
                : (variant.equipment || 'OTRO');
            return `${family}|${mode}`;
        }
        if (['overheadPress','lateralRaise','frontRaise','rearDeltFly','facePull'].includes(family)) {
            const material = ['MACHINE_SELECTORISED','MACHINE_PLATE_LOADED'].includes(variant.equipment)
                ? 'MAQUINA' : (variant.equipment || 'OTRO');
            return `${family}|${material}`;
        }
        // Brazos: el material identifica la modalidad, no el agarre,
        // la posición ni el accesorio de polea.
        if (['bicepsCurl','hammerCurl','reverseCurl','tricepsPushdown',
             'overheadTricepsExtension','lyingTricepsExtension'].includes(family)) {
            const material = ['MACHINE_SELECTORISED','MACHINE_PLATE_LOADED'].includes(variant.equipment)
                ? 'MAQUINA' : (variant.equipment || 'OTRO');
            return `${family}|${material}`;
        }
        // Piernas y glúteos: una tarjeta por plataforma/material real;
        // colocación de pies, apoyo y unilateralidad se eligen en Configurar.
        if (['backSquat','frontSquat','hackSquat','legPress','lunge',
             'splitSquat','legExtension','hipThrust','gluteKickback',
             'hipAbduction','hipAdduction'].includes(family)) {
            return `${family}|${variant.equipment || 'OTRO'}`;
        }
        // Curl femoral: sentado, tumbado y de pie son modalidades útiles.
        // Dentro de cada una, los ajustes unilaterales no generan otra tarjeta.
        if (family === 'legCurl') {
            return `${family}|${variant.equipment || 'OTRO'}|${variant.bodyPosition || 'OTRO'}`;
        }
        // Bisagras y gemelos: agrupar por equipamiento, sin duplicar
        // agarres, apoyos o número de piernas.
        if (['romanianDeadlift','deadlift','goodMorning','nordicHamstringCurl',
             'standingCalfRaise','seatedCalfRaise','calfPressLegPress'].includes(family)) {
            return `${family}|${variant.equipment || 'OTRO'}`;
        }
        // Core: una tarjeta por patrón y modalidad; unilateralidad, dirección
        // y dificultad permanecen como opciones reales en Configurar.
        if (family === 'legRaise') {
            return `${family}|${variant.supportType === 'MACHINE_SUPPORTED' ? 'SILLA' : 'COLGADO'}`;
        }
        if (['crunch','pallofPress','reverseCrunch','woodchopper','deadBug'].includes(family)) {
            return `${family}|${variant.equipment || 'OTRO'}`;
        }
        if (['plank','abWheel','sidePlank'].includes(family)) {
            return family;
        }
        // Aperturas: diferencia útil de posición/recorrido y material.
        if (family === 'chestFly') {
            return `${family}|${variant.equipment || 'OTRO'}`;
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
        const tokens = normalize(query).split(/\s+/).filter(word => word && !['de','del','la','las','el','los','en','con','y','para'].includes(word));
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
            if ((!tokens.length || matches(exercise.name, tokens)) && ![
                'benchPress','machineChestPress','chestFly','pullUp','latPulldown',
                'machineRow','seatedCableRow','overheadPress','lateralRaise',
                'frontRaise','rearDeltFly','facePull',
                'bicepsCurl','hammerCurl','reverseCurl','tricepsPushdown',
                'overheadTricepsExtension','lyingTricepsExtension',
                'backSquat','frontSquat','hackSquat','legPress','lunge',
                'splitSquat','legExtension','hipThrust','gluteKickback',
                'hipAbduction','hipAdduction','romanianDeadlift','deadlift',
                'goodMorning','legCurl','nordicHamstringCurl',
                'standingCalfRaise','seatedCalfRaise','calfPressLegPress',
                'crunch','legRaise','plank','pallofPress','reverseCrunch',
                'abWheel','sidePlank','woodchopper','deadBug'
            ].includes(exercise.code)) {
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
                ({LOW_INCLINE:'inclinacion ligera baja inclinado 15 grados',
                    INCLINE:'inclinacion inclinado 30 45 grados',
                    HIGH_INCLINE:'inclinacion alta inclinado 60 grados'})[variant.benchAngle] || '',
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
            groups.forEach((group, key) => {
                const fullGroup = available.filter(item => groupKey(exercise, item) === key);
                const main = preferred(group);
                const materials = [...new Set(fullGroup.map(item => friendly(item.equipment)))];
                const angled = group.every(item =>
                    ['LOW_INCLINE','INCLINE','HIGH_INCLINE'].includes(item.benchAngle));
                const inclinedSearch = tokens.some(word => word.startsWith('inclin'));
                const adj = angled && inclinedSearch ? ' inclinado' : '';
                let title = exercise.name;
                if (exercise.code === 'benchPress') {
                    title = main.equipment === 'SMITH_MACHINE'
                        ? 'Press de banca' + adj + ' en Smith'
                        : 'Press de banca' + adj;
                } else if (exercise.code === 'machineChestPress') {
                    title = 'Press de pecho' + adj + ' en máquina';
                } else if (exercise.code === 'chestFly') {
                    title = 'Aperturas de pecho · ' + materials.join(' / ');
                } else if (exercise.code === 'pullUp') {
                    const grips = {PRONATED:'pronas',SUPINATED:'supinas',NEUTRAL:'neutras'};
                    title = 'Dominadas ' + (grips[main.gripType] || 'con agarre especial');
                } else if (exercise.code === 'latPulldown') {
                    title = main.laterality === 'UNILATERAL' ? 'Jalón unilateral en polea' : 'Jalón al pecho';
                } else if (exercise.code === 'machineRow') {
                    title = main.equipment === 'MACHINE_SELECTORISED'
                        ? 'Remo en máquina selectorizada' : 'Remo en máquina de discos';
                } else if (exercise.code === 'seatedCableRow') {
                    title = main.laterality === 'UNILATERAL' ? 'Remo unilateral en polea' : 'Remo sentado en polea';
                } else if (exercise.code === 'overheadPress') {
                    title = main.equipment === 'SMITH_MACHINE' ? 'Press de hombros en Smith'
                        : ['MACHINE_SELECTORISED','MACHINE_PLATE_LOADED'].includes(main.equipment)
                        ? 'Press de hombros en máquina'
                        : main.equipment === 'DUMBBELL' ? 'Press de hombros con mancuernas' : 'Press militar con barra';
                } else if (exercise.code === 'lateralRaise') {
                    title = main.equipment === 'CABLE' ? 'Elevaciones laterales en polea'
                        : main.equipment?.startsWith('MACHINE_') ? 'Elevaciones laterales en máquina'
                        : 'Elevaciones laterales con mancuernas';
                } else if (exercise.code === 'frontRaise') {
                    title = main.equipment === 'CABLE' ? 'Elevaciones frontales en polea'
                        : main.equipment === 'WEIGHT_PLATE' ? 'Elevaciones frontales con disco'
                        : 'Elevaciones frontales con mancuernas';
                } else if (exercise.code === 'rearDeltFly') {
                    title = main.equipment === 'CABLE' ? 'Aperturas de deltoide posterior en polea'
                        : main.equipment?.startsWith('MACHINE_') ? 'Aperturas de deltoide posterior en máquina'
                        : 'Aperturas de deltoide posterior con mancuernas';
                } else if (exercise.code === 'facePull') {
                    title = main.equipment === 'BAND' ? 'Face pull con banda elástica' : 'Face pull en polea';
                } else if (['bicepsCurl','hammerCurl','reverseCurl'].includes(exercise.code)) {
                    const base = exercise.code === 'bicepsCurl' ? 'Curl de bíceps'
                        : exercise.code === 'hammerCurl' ? 'Curl martillo' : 'Curl inverso';
                    const queryWords = normalize(query);
                    const specific = exercise.code === 'bicepsCurl' &&
                        /\b(predicador|concentracion)\b/.test(queryWords)
                        ? (queryWords.includes('predicador') ? ' predicador' : ' de concentración') : '';
                    const equipmentName = main.equipment === 'CABLE' ? ' en polea'
                        : main.equipment === 'EZ_BAR' ? ' con barra Z'
                        : main.equipment === 'BARBELL' ? ' con barra'
                        : main.equipment === 'DUMBBELL' ? ' con mancuernas'
                        : main.equipment?.startsWith('MACHINE_') ? ' en máquina' : '';
                    title = base + specific + equipmentName;
                } else if (exercise.code === 'tricepsPushdown') {
                    title = 'Extensión de tríceps en polea';
                } else if (['overheadTricepsExtension','lyingTricepsExtension'].includes(exercise.code)) {
                    const base = exercise.code === 'overheadTricepsExtension'
                        ? 'Extensión de tríceps sobre la cabeza' : 'Extensión de tríceps tumbado';
                    const equipmentName = main.equipment === 'CABLE' ? ' en polea'
                        : main.equipment === 'EZ_BAR' ? ' con barra Z'
                        : main.equipment === 'BARBELL' ? ' con barra'
                        : main.equipment === 'DUMBBELL' ? ' con mancuernas'
                        : main.equipment?.startsWith('MACHINE_') ? ' en máquina' : '';
                    title = base + equipmentName;
                } else if (['backSquat','frontSquat','hackSquat','legPress','lunge',
                            'splitSquat','legExtension','hipThrust','gluteKickback',
                            'hipAbduction','hipAdduction'].includes(exercise.code)) {
                    const bases = {
                        backSquat:'Sentadilla trasera',
                        frontSquat:'Sentadilla frontal',
                        hackSquat:'Sentadilla hack',
                        legPress:'Prensa de piernas',
                        lunge:'Zancadas',
                        splitSquat:'Sentadilla dividida',
                        legExtension:'Extensión de piernas',
                        hipThrust:'Hip thrust',
                        gluteKickback:'Patada de glúteo',
                        hipAbduction:'Abducción de cadera',
                        hipAdduction:'Aducción de cadera'
                    };
                    const gear = {
                        BARBELL:' con barra', DUMBBELL:' con mancuernas',
                        SMITH_MACHINE:' en Smith', CABLE:' en polea',
                        MACHINE_SELECTORISED:' en máquina selectorizada',
                        MACHINE_PLATE_LOADED:' en máquina de discos',
                        BAND:' con banda', BODYWEIGHT:' con peso corporal'
                    };
                    const specific = normalize(query);
                    const chosen = exercise.code === 'splitSquat' && /bulgar/.test(specific)
                        ? 'Sentadilla búlgara'
                        : exercise.code === 'lunge' && /inversa/.test(specific)
                        ? 'Zancada inversa'
                        : bases[exercise.code];
                    title = chosen + (gear[main.equipment] || '');
                } else if (['romanianDeadlift','deadlift','goodMorning',
                            'nordicHamstringCurl','legCurl',
                            'standingCalfRaise','seatedCalfRaise','calfPressLegPress'
                           ].includes(exercise.code)) {
                    const gear = {
                        BARBELL:' con barra', DUMBBELL:' con mancuernas',
                        KETTLEBELL:' con kettlebell', SMITH_MACHINE:' en Smith',
                        TRAP_BAR:' con trap bar', CABLE:' en polea',
                        MACHINE_SELECTORISED:' en máquina selectorizada',
                        MACHINE_PLATE_LOADED:' en máquina de discos',
                        BAND:' con banda', BODYWEIGHT:' con peso corporal'
                    };
                    const base = {
                        romanianDeadlift:'Peso muerto rumano', deadlift:'Peso muerto',
                        goodMorning:'Buenos días', nordicHamstringCurl:'Curl nórdico',
                        legCurl:'Curl femoral', standingCalfRaise:'Elevación de gemelos de pie',
                        seatedCalfRaise:'Elevación de gemelos sentado',
                        calfPressLegPress:'Elevación de gemelos en prensa'
                    }[exercise.code];
                    if (exercise.code === 'legCurl') {
                        const positions = {SEATED:' sentado',PRONE:' tumbado',STANDING:' de pie'};
                        title = base + (positions[main.bodyPosition] || '') + (gear[main.equipment] || '');
                    } else if (exercise.code === 'deadlift' && /\bsumo\b/.test(normalize(query))
                               && group.every(item=>item.stanceType === 'SUMO')) {
                        title = 'Peso muerto sumo' + (gear[main.equipment] || '');
                    } else {
                        title = base + (gear[main.equipment] || '');
                    }
                }
                // Las modalidades de core necesitan nombres visibles y concisos.
                else if (['crunch','legRaise','plank','pallofPress','reverseCrunch',
                          'abWheel','sidePlank','woodchopper','deadBug'].includes(exercise.code)) {
                    const gear = {
                        BODYWEIGHT:'', CABLE:' en polea', BAND:' con banda',
                        WEIGHT_PLATE:' con disco', BENCH:' en banco',
                        MACHINE_SELECTORISED:' en máquina', AB_WHEEL:''
                    };
                    const base = {
                        crunch:'Crunch abdominal', legRaise:'Elevación de piernas',
                        plank:'Plancha frontal', pallofPress:'Press Pallof',
                        reverseCrunch:'Crunch inverso', abWheel:'Rueda abdominal',
                        sidePlank:'Plancha lateral', woodchopper:'Giro diagonal',
                        deadBug:'Dead bug'
                    }[exercise.code];
                    if (exercise.code === 'legRaise') {
                        title = main.supportType === 'MACHINE_SUPPORTED'
                            ? 'Elevación de piernas en silla romana'
                            : 'Elevación de piernas colgado';
                    } else if (exercise.code === 'reverseCrunch' && main.equipment === 'BODYWEIGHT') {
                        title = 'Crunch inverso en suelo';
                    } else {
                        title = base + (gear[main.equipment] || '');
                    }
                }
                const detail = materials.join(' / ') +
                    (fullGroup.length > 1 ? ' · ' + fullGroup.length + ' configuraciones' : '');
                results.push({
                    exercise, variant: main,
                    variantCodes: fullGroup.map(item => item.code),
                    matchingCodes: group.map(item => item.code),
                    kind: 'modality', title, detail
                });
            });
        });
        return results;
    }

    const api = Object.freeze({normalize, matches, search, groupKey, preferred});
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.FitCoreExerciseSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
