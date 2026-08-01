-- Differentiate the existing 3 x 3 pull-up matrix without changing variant IDs.
-- SVG identifiers remain a frontend concern; this migration stores canonical
-- muscle codes, technical focus and conservative evidence metadata only.

ALTER TABLE exercise_muscle_activations
    DROP CONSTRAINT exercise_activation_evidence_level_check;
ALTER TABLE exercise_muscle_activations
    ADD CONSTRAINT exercise_activation_evidence_level_check CHECK (evidence_level IN (
        'HIGH', 'MEDIUM', 'LOW_MEDIUM', 'LOW', 'REVIEW'
    ));

ALTER TABLE exercise_variants
    DROP CONSTRAINT exercise_variant_focus_evidence_level_check;
ALTER TABLE exercise_variants
    ADD CONSTRAINT exercise_variant_focus_evidence_level_check CHECK (focus_evidence_level IN (
        'HIGH', 'MEDIUM', 'LOW_MEDIUM', 'LOW', 'REVIEW'
    ));

DO $$
BEGIN
    IF (SELECT count(*)
        FROM exercise_variants variant
        JOIN exercises exercise ON exercise.id = variant.exercise_id
        WHERE exercise.code = 'pullUp') <> 9 THEN
        RAISE EXCEPTION 'Expected exactly 9 pull-up variants before applying V15';
    END IF;
END $$;

UPDATE exercise_variants variant
SET primary_focus = seed.primary_focus,
    secondary_focus = seed.secondary_focus,
    practicality = seed.practicality,
    requires_caution = seed.requires_caution,
    focus_evidence_type = seed.evidence_type,
    focus_evidence_level = seed.evidence_level,
    focus_description = seed.description,
    updated_at = CURRENT_TIMESTAMP
FROM (VALUES
    ('pullUpBodyweightNeutralNarrowGrip', 'LAT_BIAS', 'BRACHIALIS_BRACHIORADIALIS_BIAS', 'COMMON', false,
     'BIOMECHANICAL_INFERENCE', 'MEDIUM',
     'Agarre neutro estrecho: dorsal como motor principal y sesgo técnico de braquial, braquiorradial y agarre. La combinación exacta se apoya en anatomía funcional e inferencia biomecánica.'),
    ('pullUpBodyweightNeutralMediumGrip', 'LAT_BIAS', 'BRACHIALIS_BRACHIORADIALIS_BIAS', 'COMMON', false,
     'BIOMECHANICAL_INFERENCE', 'MEDIUM',
     'Agarre neutro medio: variante equilibrada entre dorsal, flexores del codo y control del agarre. No se presenta como aislamiento muscular.'),
    ('pullUpBodyweightNeutralWideGrip', 'BACK_WIDTH', 'LAT_BIAS', 'MACHINE_DEPENDENT', false,
     'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM',
     'Agarre neutro ancho: sesgo práctico de amplitud dorsal dependiente de una barra o máquina compatible; la evidencia directa exacta es limitada.'),
    ('pullUpBodyweightPronatedNarrowGrip', 'LAT_BIAS', 'GRIP_STRENGTH', 'COMMON', false,
     'BIOMECHANICAL_INFERENCE', 'MEDIUM',
     'Agarre prono estrecho: tracción vertical con recorrido amplio, dorsal principal y contribución moderada de brazo y agarre.'),
    ('pullUpBodyweightPronatedMediumGrip', 'LAT_BIAS', 'BACK_WIDTH', 'COMMON', false,
     'DIRECT_EMG', 'MEDIUM',
     'Dominada prono media general: dorsal como motor principal. La evidencia EMG directa respalda el patrón general, no cada anchura exacta.'),
    ('pullUpBodyweightPronatedWideGrip', 'BACK_WIDTH', 'LAT_BIAS', 'COMMON', false,
     'INDIRECT_EMG_FROM_SIMILAR_EXERCISE', 'MEDIUM',
     'Agarre prono ancho: sesgo práctico de amplitud. La diferenciación por anchura se apoya parcialmente en estudios de jalón al pecho y no garantiza mayor hipertrofia.'),
    ('pullUpBodyweightSupinatedNarrowGrip', 'LAT_BIAS', 'BICEPS_BIAS', 'COMMON', false,
     'BIOMECHANICAL_INFERENCE', 'MEDIUM',
     'Chin-up estrecha: dorsal principal con mayor ayuda relativa del bíceps que en agarre prono; la anchura exacta se trata como inferencia.'),
    ('pullUpBodyweightSupinatedMediumGrip', 'LAT_BIAS', 'BICEPS_BIAS', 'COMMON', false,
     'DIRECT_EMG', 'MEDIUM',
     'Chin-up media general: dorsal como motor principal y mayor contribución relativa del bíceps. La evidencia directa respalda el patrón general.'),
    ('pullUpBodyweightSupinatedWideGrip', 'LAT_BIAS', 'BICEPS_BIAS', 'UNCOMMON', true,
     'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM',
     'Variante supina ancha poco habitual. Depende de la movilidad y del equipamiento y no debe recomendarse como opción principal por defecto.')
) AS seed(code, primary_focus, secondary_focus, practicality, requires_caution,
          evidence_type, evidence_level, description)
WHERE variant.code = seed.code;

-- Remove copied v13 activations that are not part of the reviewed pull-up set.
DELETE FROM exercise_muscle_activations activation
USING exercise_variants variant, exercises exercise, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND variant.exercise_id = exercise.id
  AND activation.muscle_id = muscle.id
  AND exercise.code = 'pullUp'
  AND muscle.code NOT IN (
      'LATISSIMUS_DORSI', 'TERES_MAJOR', 'BICEPS_BRACHII', 'BRACHIALIS',
      'BRACHIORADIALIS', 'DELTOID_POSTERIOR', 'FOREARM_FLEXORS_REGION',
      'TRAPEZIUS_MIDDLE', 'TRAPEZIUS_LOWER', 'RHOMBOIDS_REGION',
      'RECTUS_ABDOMINIS', 'OBLIQUES_REGION', 'TRANSVERSE_ABDOMINIS_REGION'
  );

-- Shared prime mover, scapular/grip stabilizers and trunk stabilizers.
WITH variant_evidence(code, lat_evidence_type, lat_evidence_level, lat_source_ref, lat_rationale) AS (VALUES
    ('pullUpBodyweightNeutralNarrowGrip', 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Tracción vertical con dorsal como motor principal; la combinación neutra estrecha es una inferencia biomecánica.'),
    ('pullUpBodyweightNeutralMediumGrip', 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Tracción vertical equilibrada con dorsal como motor principal; no hay evidencia directa específica de esta combinación.'),
    ('pullUpBodyweightNeutralWideGrip', 'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM', 'NASM_PULL_UP', 'Sesgo práctico de amplitud dorsal con agarre neutro ancho; evidencia exacta limitada y dependiente del equipamiento.'),
    ('pullUpBodyweightPronatedNarrowGrip', 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Dorsal principal en tracción vertical; la anchura prono estrecha se interpreta biomecánicamente.'),
    ('pullUpBodyweightPronatedMediumGrip', 'DIRECT_EMG', 'MEDIUM', 'PMID:21068680', 'Evidencia EMG directa del patrón general de pull-up prono, sin extrapolarla a todas las anchuras.'),
    ('pullUpBodyweightPronatedWideGrip', 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE', 'MEDIUM', 'PMID:20543740/12423182', 'Dorsal principal; el sesgo por agarre ancho se apoya indirectamente en estudios de jalón al pecho.'),
    ('pullUpBodyweightSupinatedNarrowGrip', 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'PMID:21068680', 'Dorsal principal en chin-up; la evidencia directa es del patrón general y la anchura estrecha se infiere.'),
    ('pullUpBodyweightSupinatedMediumGrip', 'DIRECT_EMG', 'MEDIUM', 'PMID:21068680', 'Evidencia EMG directa del patrón general de chin-up, manteniendo el dorsal como motor principal.'),
    ('pullUpBodyweightSupinatedWideGrip', 'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM', 'NASM_PULL_UP', 'Dorsal principal en una combinación supina ancha poco habitual y con evidencia exacta limitada.')
), common_activation(muscle_code, role, activation_level, evidence_type, evidence_level, source_ref, rationale) AS (VALUES
    ('LATISSIMUS_DORSI', NULL, NULL, NULL, NULL, NULL, NULL),
    ('TERES_MAJOR', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Sinergista del dorsal en extensión y aducción del hombro; no se trata como protagonista.'),
    ('FOREARM_FLEXORS_REGION', 'STABILIZER', 1, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Mantiene el agarre isométrico durante toda la dominada.'),
    ('TRAPEZIUS_MIDDLE', 'STABILIZER', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Controla la retracción y posición escapular durante la tracción.'),
    ('TRAPEZIUS_LOWER', 'STABILIZER', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Contribuye a la depresión y al control escapular.'),
    ('RHOMBOIDS_REGION', 'STABILIZER', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Estabiliza la retracción escapular; su representación SVG es una aproximación regional.'),
    ('RECTUS_ABDOMINIS', 'STABILIZER', 1, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Ayuda a limitar el balanceo y mantener la posición del tronco.'),
    ('OBLIQUES_REGION', 'STABILIZER', 1, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Aporta estabilidad del tronco y control anti-rotación.'),
    ('TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 1, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Representa el braceo profundo del tronco; no dispone de región SVG directa.')
), normalized AS (
    SELECT variant.id AS variant_id,
           muscle.id AS muscle_id,
           common.muscle_code,
           CASE WHEN common.muscle_code = 'LATISSIMUS_DORSI' THEN 'PRIMARY' ELSE common.role END AS role,
           CASE WHEN common.muscle_code = 'LATISSIMUS_DORSI' THEN 3 ELSE common.activation_level END AS activation_level,
           CASE WHEN common.muscle_code = 'LATISSIMUS_DORSI' THEN evidence.lat_evidence_type ELSE common.evidence_type END AS evidence_type,
           CASE WHEN common.muscle_code = 'LATISSIMUS_DORSI' THEN evidence.lat_evidence_level ELSE common.evidence_level END AS evidence_level,
           CASE WHEN common.muscle_code = 'LATISSIMUS_DORSI' THEN evidence.lat_source_ref ELSE common.source_ref END AS source_ref,
           CASE WHEN common.muscle_code = 'LATISSIMUS_DORSI' THEN evidence.lat_rationale ELSE common.rationale END AS rationale
    FROM variant_evidence evidence
    JOIN exercise_variants variant ON variant.code = evidence.code
    CROSS JOIN common_activation common
    JOIN muscles muscle ON muscle.code = common.muscle_code
)
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at)
SELECT normalized.variant_id, normalized.muscle_id, normalized.role, normalized.activation_level,
       normalized.rationale,
       CASE normalized.evidence_level WHEN 'HIGH' THEN 'HIGH' WHEN 'REVIEW' THEN 'REVIEW' ELSE 'MEDIUM' END,
       CASE normalized.evidence_type
           WHEN 'DIRECT_EMG' THEN 'PEER_REVIEWED'
           WHEN 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE' THEN 'PROFESSIONAL_REFERENCE'
           WHEN 'ANATOMICAL_CONSENSUS' THEN 'ANATOMICAL_REFERENCE'
           ELSE 'BIOMECHANICAL_INFERENCE' END,
       normalized.source_ref, 5, normalized.evidence_type, normalized.evidence_level,
       normalized.source_ref, normalized.rationale, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM normalized
ON CONFLICT (exercise_variant_id, muscle_id) DO UPDATE SET
    role = EXCLUDED.role,
    activation_level = EXCLUDED.activation_level,
    notes = EXCLUDED.notes,
    confidence = EXCLUDED.confidence,
    source_type = EXCLUDED.source_type,
    source_refs = EXCLUDED.source_refs,
    mapping_version = EXCLUDED.mapping_version,
    evidence_type = EXCLUDED.evidence_type,
    evidence_level = EXCLUDED.evidence_level,
    source_ref = EXCLUDED.source_ref,
    rationale = EXCLUDED.rationale,
    updated_at = CURRENT_TIMESTAMP;

-- Grip- and width-specific elbow flexors and posterior deltoid.
WITH arm_activation(variant_code, muscle_code, role, activation_level,
                    evidence_type, evidence_level, source_ref, rationale) AS (VALUES
    ('pullUpBodyweightNeutralNarrowGrip', 'BICEPS_BRACHII', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Flexión del codo en agarre neutro estrecho, sin el sesgo relativo de una chin-up.'),
    ('pullUpBodyweightNeutralNarrowGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Flexor del codo destacado por la posición neutra y el agarre estrecho.'),
    ('pullUpBodyweightNeutralNarrowGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'La posición neutra favorece su contribución relativa y el control del antebrazo.'),
    ('pullUpBodyweightNeutralNarrowGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Ayuda leve en la extensión del hombro con codos próximos al tronco.'),

    ('pullUpBodyweightNeutralMediumGrip', 'BICEPS_BRACHII', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Flexor del codo en una dominada neutra equilibrada.'),
    ('pullUpBodyweightNeutralMediumGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Contribución visible del braquial por la posición neutra del antebrazo.'),
    ('pullUpBodyweightNeutralMediumGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Contribución visible del braquiorradial y control del agarre neutro.'),
    ('pullUpBodyweightNeutralMediumGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Asiste la extensión del hombro en la variante neutra media.'),

    ('pullUpBodyweightNeutralWideGrip', 'BICEPS_BRACHII', 'SECONDARY', 1, 'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM', 'NASM_PULL_UP', 'Participación menor del bíceps al priorizar un sesgo práctico de amplitud con agarre neutro ancho.'),
    ('pullUpBodyweightNeutralWideGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Mantiene una contribución relevante a la flexión del codo en agarre neutro.'),
    ('pullUpBodyweightNeutralWideGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Participa en flexión del codo y control del antebrazo neutro.'),
    ('pullUpBodyweightNeutralWideGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM', 'NASM_PULL_UP', 'Asiste la extensión del hombro en una variante dependiente del equipamiento.'),

    ('pullUpBodyweightPronatedNarrowGrip', 'BICEPS_BRACHII', 'SECONDARY', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Flexión del codo con menor sesgo relativo de bíceps que en agarre supino.'),
    ('pullUpBodyweightPronatedNarrowGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Flexor del codo activo durante el recorrido prono estrecho.'),
    ('pullUpBodyweightPronatedNarrowGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Ayuda a la flexión y estabilización del antebrazo en pronación.'),
    ('pullUpBodyweightPronatedNarrowGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Asiste la extensión del hombro durante el recorrido amplio.'),

    ('pullUpBodyweightPronatedMediumGrip', 'BICEPS_BRACHII', 'SECONDARY', 1, 'DIRECT_EMG', 'MEDIUM', 'PMID:21068680', 'La evidencia directa del pull-up general muestra participación del bíceps, menor que el sesgo de la chin-up.'),
    ('pullUpBodyweightPronatedMediumGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Flexor del codo en la dominada prono general.'),
    ('pullUpBodyweightPronatedMediumGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Contribuye a flexión del codo y control del antebrazo prono.'),
    ('pullUpBodyweightPronatedMediumGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Asiste la extensión del hombro sin convertirse en objetivo principal.'),

    ('pullUpBodyweightPronatedWideGrip', 'BICEPS_BRACHII', 'STABILIZER', 1, 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE', 'MEDIUM', 'PMID:20543740/12423182', 'Menor sesgo relativo del bíceps en la lectura práctica del agarre prono ancho.'),
    ('pullUpBodyweightPronatedWideGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Sostiene la flexión del codo aunque el foco técnico sea amplitud dorsal.'),
    ('pullUpBodyweightPronatedWideGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Contribuye a la flexión del codo y al control del agarre prono.'),
    ('pullUpBodyweightPronatedWideGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Asiste la extensión del hombro en la trayectoria ancha.'),

    ('pullUpBodyweightSupinatedNarrowGrip', 'BICEPS_BRACHII', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'PMID:21068680', 'La supinación aumenta el sesgo relativo del bíceps; la anchura estrecha concreta se trata como inferencia.'),
    ('pullUpBodyweightSupinatedNarrowGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Participa como flexor del codo junto al mayor sesgo de bíceps.'),
    ('pullUpBodyweightSupinatedNarrowGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Contribuye a la flexión y estabilidad del antebrazo.'),
    ('pullUpBodyweightSupinatedNarrowGrip', 'DELTOID_POSTERIOR', 'STABILIZER', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Control leve del hombro en una trayectoria con mayor ayuda del codo.'),

    ('pullUpBodyweightSupinatedMediumGrip', 'BICEPS_BRACHII', 'SECONDARY', 2, 'DIRECT_EMG', 'MEDIUM', 'PMID:21068680', 'La evidencia EMG directa de chin-up respalda una mayor contribución relativa del bíceps.'),
    ('pullUpBodyweightSupinatedMediumGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Flexor del codo activo junto al bíceps en la chin-up media.'),
    ('pullUpBodyweightSupinatedMediumGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Contribuye a la flexión y al control del antebrazo durante la chin-up.'),
    ('pullUpBodyweightSupinatedMediumGrip', 'DELTOID_POSTERIOR', 'STABILIZER', 1, 'BIOMECHANICAL_INFERENCE', 'MEDIUM', 'NASM_PULL_UP', 'Control leve de la articulación del hombro durante la tracción.'),

    ('pullUpBodyweightSupinatedWideGrip', 'BICEPS_BRACHII', 'SECONDARY', 2, 'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM', 'NASM_PULL_UP', 'La supinación mantiene sesgo de bíceps, pero la combinación ancha es poco habitual y poco documentada.'),
    ('pullUpBodyweightSupinatedWideGrip', 'BRACHIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'MEDIUM', 'NASM_PULL_UP', 'Participa como flexor del codo en una variante poco habitual.'),
    ('pullUpBodyweightSupinatedWideGrip', 'BRACHIORADIALIS', 'SECONDARY', 2, 'ANATOMICAL_CONSENSUS', 'LOW_MEDIUM', 'NASM_PULL_UP', 'Contribución de flexión y estabilidad inferida para la combinación supina ancha.'),
    ('pullUpBodyweightSupinatedWideGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 1, 'BIOMECHANICAL_INFERENCE', 'LOW_MEDIUM', 'NASM_PULL_UP', 'Ayuda leve en extensión del hombro; variante marcada para precaución.')
), normalized AS (
    SELECT variant.id AS variant_id, muscle.id AS muscle_id, arm.*
    FROM arm_activation arm
    JOIN exercise_variants variant ON variant.code = arm.variant_code
    JOIN muscles muscle ON muscle.code = arm.muscle_code
)
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at)
SELECT normalized.variant_id, normalized.muscle_id, normalized.role, normalized.activation_level,
       normalized.rationale,
       CASE normalized.evidence_level WHEN 'HIGH' THEN 'HIGH' WHEN 'REVIEW' THEN 'REVIEW' ELSE 'MEDIUM' END,
       CASE normalized.evidence_type
           WHEN 'DIRECT_EMG' THEN 'PEER_REVIEWED'
           WHEN 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE' THEN 'PROFESSIONAL_REFERENCE'
           WHEN 'ANATOMICAL_CONSENSUS' THEN 'ANATOMICAL_REFERENCE'
           ELSE 'BIOMECHANICAL_INFERENCE' END,
       normalized.source_ref, 5, normalized.evidence_type, normalized.evidence_level,
       normalized.source_ref, normalized.rationale, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM normalized
ON CONFLICT (exercise_variant_id, muscle_id) DO UPDATE SET
    role = EXCLUDED.role,
    activation_level = EXCLUDED.activation_level,
    notes = EXCLUDED.notes,
    confidence = EXCLUDED.confidence,
    source_type = EXCLUDED.source_type,
    source_refs = EXCLUDED.source_refs,
    mapping_version = EXCLUDED.mapping_version,
    evidence_type = EXCLUDED.evidence_type,
    evidence_level = EXCLUDED.evidence_level,
    source_ref = EXCLUDED.source_ref,
    rationale = EXCLUDED.rationale,
    updated_at = CURRENT_TIMESTAMP;
