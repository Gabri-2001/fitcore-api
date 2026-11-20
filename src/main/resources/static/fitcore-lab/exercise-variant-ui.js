// FitCore · Nombres visibles de ejercicios y variantes (sin mutar códigos internos).
// El nombre base sigue agrupando búsquedas generales; las coincidencias específicas
// muestran una variante con nombre propio en todas las pantallas.
(function (root) {
    'use strict';

    function variantTitle(exercise, variant) {
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
                LOW_INCLINE: 'con inclinación ligera',
                INCLINE: 'inclinado',
                HIGH_INCLINE: 'con inclinación alta',
                DECLINE: 'declinado'
            }[variant.benchAngle];
            if (angle) return `${base} ${angle}${variant.equipment === 'SMITH_MACHINE' ? ' en Smith' : ''}`;
        }
        // Para cualquier otra familia conservamos el nombre específico
        // registrado. Solo quitamos el sufijo de agarre separado por coma;
        // su información sigue visible como ficha técnica.
        return specific.replace(/,\s*agarre\b.*$/iu, '').trim() || base;
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = {variantTitle};
    root.FitCoreVariantUI = Object.freeze({variantTitle});
})(typeof globalThis !== 'undefined' ? globalThis : this);
