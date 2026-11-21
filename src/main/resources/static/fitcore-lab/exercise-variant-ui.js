// FitCore · Nombres visibles de ejercicios y variantes (sin mutar códigos internos).
// El nombre base sigue agrupando búsquedas generales; las coincidencias específicas
// muestran una variante con nombre propio en todas las pantallas.
(function (root) {
    'use strict';

    function angleLabel(value) {
        return ({FLAT:'Plano (0°)', LOW_INCLINE:'Inclinado (≈15°)',
            INCLINE:'Inclinado (≈30–45°)', HIGH_INCLINE:'Inclinado (≈60°)',
            DECLINE:'Declinado (ángulo variable)', UPRIGHT:'Vertical (≈90°)'})[value]
            || String(value ?? '');
    }

    // Sentado/tumbado en una máquina específica puede definir el movimiento;
    // no debemos esconder esa información como si fuese una mera preferencia.
    const essentialPositionFamilies = new Set([
        'legCurl','standingCalfRaise','seatedCalfRaise','seatedCableRow',
        'legRaise','scapularPushUp'
    ]);

    function normalizeName(value) {
        return String(value ?? '').normalize('NFD')
            .replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
    }

    function optionalPosition(exercise, variant) {
        if (!['STANDING','SEATED'].includes(variant?.bodyPosition)) return false;
        if (essentialPositionFamilies.has(exercise?.code)) return false;
        // Si el nombre BASE incluye postura, esa característica es definitoria.
        return !/\b(de pie|sentad[oa]s?)\b/.test(normalizeName(exercise?.name));
    }

    function hasOptionalPosition(exercise, variants) {
        const positions = new Set((variants || [])
            .filter(v => v.active !== false && optionalPosition(exercise,v))
            .map(v => v.bodyPosition));
        return positions.has('STANDING') && positions.has('SEATED');
    }

    function queryRequestsPosition(query) {
        return /\b(de pie|sentad[oa]s?)\b/.test(normalizeName(query));
    }

    function variantTitle(exercise, variant, options = {}) {
        const base = String(exercise?.name ?? '').trim();
        if (!variant) return base || 'Ejercicio';

        const specific = String(variant.name ?? '').trim() || base;
        const normalizedBase = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('es');
        // En banco, el material/agarre queda debajo y el título muestra el
        // ángulo de la ejecución. La regla se aplica por familia, no por código.
        if (normalizedBase.includes('press de banca')) {
            const angle = {
                FLAT: 'plano',
                LOW_INCLINE: 'inclinado (≈15°)',
                INCLINE: 'inclinado (≈30–45°)',
                HIGH_INCLINE: 'inclinado (≈60°)',
                DECLINE: 'declinado'
            }[variant.benchAngle];
            if (angle) return `${base} ${angle}${variant.equipment === 'SMITH_MACHINE' ? ' en Smith' : ''}`;
        }
        // Para cualquier otra familia conservamos el nombre específico
        // registrado. Solo quitamos el sufijo de agarre separado por coma;
        // su información sigue visible como ficha técnica.
        let visible = specific.replace(/,\s*agarre\b.*$/iu, '').trim() || base;
        if (!options.showPosition && optionalPosition(exercise, variant)) {
            visible = visible.replace(/\s+de pie\b/giu, '')
                .replace(/\s+sentad[oa]s?\b/giu, '')
                .replace(/\s{2,}/g,' ').trim();
        }
        return visible;
    }

    const api = Object.freeze({
        variantTitle, angleLabel, optionalPosition, hasOptionalPosition, queryRequestsPosition
    });
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.FitCoreVariantUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
