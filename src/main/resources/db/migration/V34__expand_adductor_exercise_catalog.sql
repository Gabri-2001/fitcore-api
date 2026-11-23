-- V34: completar ADUCTORES sin duplicar la familia existente hipAdduction.
-- No se modifican identificadores, registros previos ni migraciones aplicadas.
-- Se distinguen los movimientos dinámicos (repeticiones) de los isométricos (segundos).
-- Las activaciones son descripciones anatómicas cualitativas, NO porcentajes EMG.
-- Referencias orientativas: PMC10569248 (progresión de Copenhagen),
-- PMC5867683 (aducción isométrica con balón) y PMID 41931009 (variantes de palanca corta/larga).

INSERT INTO exercises (
    code, name, exercise_category, main_muscle_group, movement_pattern,
    description, calories_estimation_type, base_calories_per_unit,
    default_unit, active, created_at, updated_at
)
VALUES
    ('copenhagenPlank', 'Plancha Copenhagen', 'STRENGTH', 'ADDUCTORS', 'HIP_ADDUCTION',
     'Apoyo lateral con pierna superior sobre banco. Exige fuerza de aductores y estabilidad de tronco; progresar de palanca corta a larga.',
     'DURATION_BASED', NULL, 'SECONDS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('adductorSqueeze', 'Apretón isométrico de aductores', 'STRENGTH', 'ADDUCTORS', 'HIP_ADDUCTION',
     'Compresión sostenida de un balón entre las rodillas para trabajar aducción de cadera sin desplazamiento.',
     'DURATION_BASED', NULL, 'SECONDS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- La máquina hipAdductionMachineSeated ya existe y sigue siendo la opción predeterminada.
-- No se crea una segunda familia para polea, banda o movimiento tumbado.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    resistance_source, required_facility, allows_added_weight, allows_assistance,
    is_default, created_at, updated_at
)
SELECT seed.code, seed.name, exercise.id, seed.equipment,
       'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE',
       seed.body_position, seed.laterality, seed.trajectory, seed.support_type,
       seed.stance_type, seed.attachment_type, 'ARMS_BY_SIDES',
       'NOT_APPLICABLE', seed.knee_position, seed.contraction_type,
       seed.requires_caution, true, 'ADDUCTOR_BIAS', seed.secondary_focus,
       seed.practicality, seed.focus_description, 'BIOMECHANICAL_INFERENCE', 'MEDIUM',
       seed.resistance_source, seed.required_facility, false, false,
       seed.is_default, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('hipAdductionCableStandingSingleLeg', 'Aducción de cadera de pie en polea', 'hipAdduction',
     'CABLE', 'STANDING', 'UNILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM',
     'ANKLE_STRAP', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, NULL, 'MACHINE_DEPENDENT',
     'Aducción con tobillera de polea baja; mantener pelvis estable y registrar la carga real de la máquina.',
     'EXTERNAL_LOAD', 'NONE', false),
    ('hipAdductionBandStandingSingleLeg', 'Aducción de cadera de pie con banda', 'hipAdduction',
     'BAND', 'STANDING', 'UNILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM',
     'NO_ATTACHMENT', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, NULL, 'COMMON',
     'Aducción con banda anclada; la resistencia varía con el estiramiento y no equivale a un peso exacto.',
     'EXTERNAL_LOAD', 'NONE', false),
    ('hipAdductionBodyweightSideLying', 'Aducción de cadera tumbado de lado', 'hipAdduction',
     'BODYWEIGHT', 'SIDE_LYING', 'UNILATERAL', 'UPWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE',
     'NO_ATTACHMENT', 'EXTENDED', 'DYNAMIC', false, NULL, 'COMMON',
     'Elevar la pierna inferior tumbado de lado; empezar con recorrido controlado y sin carga externa.',
     'BODYWEIGHT', 'NONE', false),
    ('copenhagenPlankShortLeverBench', 'Plancha Copenhagen con rodilla apoyada', 'copenhagenPlank',
     'BODYWEIGHT', 'SIDE_LYING', 'UNILATERAL', 'NOT_APPLICABLE', 'BENCH_SUPPORTED', 'NOT_APPLICABLE',
     'NO_ATTACHMENT', 'FLEXED', 'ISOMETRIC', true, 'CORE_LATERAL_STABILITY', 'TECHNIQUE_DEPENDENT',
     'Palanca corta: apoyar la rodilla de arriba en un banco. Avanzar de forma gradual y detenerse ante dolor inguinal.',
     'BODYWEIGHT', 'BENCH', true),
    ('copenhagenPlankLongLeverBench', 'Plancha Copenhagen con tobillo apoyado', 'copenhagenPlank',
     'BODYWEIGHT', 'SIDE_LYING', 'UNILATERAL', 'NOT_APPLICABLE', 'BENCH_SUPPORTED', 'NOT_APPLICABLE',
     'NO_ATTACHMENT', 'EXTENDED', 'ISOMETRIC', true, 'CORE_LATERAL_STABILITY', 'TECHNIQUE_DEPENDENT',
     'Palanca larga con tobillo sobre el banco: exige más capacidad; reservar para personas familiarizadas con la progresión.',
     'BODYWEIGHT', 'BENCH', false),
    ('adductorSqueezeBallSupine', 'Apretón de balón entre rodillas tumbado', 'adductorSqueeze',
     'MEDICINE_BALL', 'SUPINE', 'BILATERAL', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE',
     'NO_ATTACHMENT', 'FLEXED', 'ISOMETRIC', false, NULL, 'COMMON',
     'Mantener una presión cómoda y constante sobre un balón entre las rodillas, sin valorar la carga por los kilogramos del balón.',
     'BODYWEIGHT', 'NONE', true),
    ('adductorSqueezeBallSeated', 'Apretón de balón entre rodillas sentado', 'adductorSqueeze',
     'MEDICINE_BALL', 'SEATED', 'BILATERAL', 'NOT_APPLICABLE', 'BENCH_SUPPORTED', 'NOT_APPLICABLE',
     'NO_ATTACHMENT', 'FLEXED', 'ISOMETRIC', false, NULL, 'COMMON',
     'Presión isométrica entre rodillas en posición sentada; registrar duración, no repeticiones ni peso transportado.',
     'BODYWEIGHT', 'BENCH', false)
) AS seed (
    code, name, exercise_code, equipment, body_position, laterality,
    trajectory, support_type, stance_type, attachment_type, knee_position,
    contraction_type, requires_caution, secondary_focus, practicality,
    focus_description, resistance_source, required_facility, is_default
)
JOIN exercises exercise ON exercise.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- Papel muscular orientativo. HIP_ADDUCTORS_REGION es una región visual
-- existente, no una nueva región SVG ni un músculo artificial.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale,
    created_at, updated_at
)
SELECT variant.id, muscle.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE seed.evidence_level WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 14,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Estimación anatómica cualitativa por movimiento y apoyo; no representa porcentaje EMG.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('hipAdductionCableStandingSingleLeg', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('hipAdductionCableStandingSingleLeg', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('hipAdductionBandStandingSingleLeg', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('hipAdductionBandStandingSingleLeg', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('hipAdductionBodyweightSideLying', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('hipAdductionBodyweightSideLying', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('copenhagenPlankShortLeverBench', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('copenhagenPlankShortLeverBench', 'OBLIQUES_REGION', 'SECONDARY', 'LOW'),
    ('copenhagenPlankShortLeverBench', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('copenhagenPlankLongLeverBench', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('copenhagenPlankLongLeverBench', 'OBLIQUES_REGION', 'SECONDARY', 'LOW'),
    ('copenhagenPlankLongLeverBench', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('adductorSqueezeBallSupine', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('adductorSqueezeBallSeated', 'HIP_ADDUCTORS_REGION', 'PRIMARY', 'MEDIUM')
) AS seed(variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

DO $$
DECLARE
    families integer;
    new_variants integer;
    mappings integer;
    defaults integer;
BEGIN
    SELECT COUNT(*) INTO families FROM exercises
    WHERE code IN ('copenhagenPlank','adductorSqueeze') AND main_muscle_group = 'ADDUCTORS';
    IF families <> 2 THEN RAISE EXCEPTION 'V34: missing new adductor families'; END IF;

    SELECT COUNT(*) INTO new_variants FROM exercise_variants
    WHERE code IN (
        'hipAdductionCableStandingSingleLeg','hipAdductionBandStandingSingleLeg',
        'hipAdductionBodyweightSideLying','copenhagenPlankShortLeverBench',
        'copenhagenPlankLongLeverBench','adductorSqueezeBallSupine',
        'adductorSqueezeBallSeated'
    );
    IF new_variants <> 7 THEN RAISE EXCEPTION 'V34: expected seven new variants, found %', new_variants; END IF;

    SELECT COUNT(*) INTO mappings FROM exercise_muscle_activations
    WHERE mapping_version = 14;
    IF mappings <> 14 THEN RAISE EXCEPTION 'V34: expected 14 muscle mappings, found %', mappings; END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        WHERE v.code IN (
            'hipAdductionCableStandingSingleLeg','hipAdductionBandStandingSingleLeg',
            'hipAdductionBodyweightSideLying','copenhagenPlankShortLeverBench',
            'copenhagenPlankLongLeverBench','adductorSqueezeBallSupine',
            'adductorSqueezeBallSeated'
        ) AND NOT EXISTS (
            SELECT 1 FROM exercise_muscle_activations a
            WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
        )
    ) THEN RAISE EXCEPTION 'V34: new variant without primary activation'; END IF;

    SELECT COUNT(*) INTO defaults
    FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
    WHERE e.main_muscle_group = 'ADDUCTORS' AND v.active AND v.is_default;
    IF defaults <> 3 THEN RAISE EXCEPTION 'V34: adductors require exactly three family defaults'; END IF;

    IF EXISTS (
        SELECT 1 FROM exercises e
        WHERE e.code IN ('hipAdduction', 'copenhagenPlank', 'adductorSqueeze')
        AND (SELECT COUNT(*) FROM exercise_variants v
             WHERE v.exercise_id = e.id AND v.active AND v.is_default) <> 1
    ) THEN RAISE EXCEPTION 'V34: missing or ambiguous default for an adductor family'; END IF;

    IF (SELECT default_unit FROM exercises WHERE code = 'copenhagenPlank') <> 'SECONDS'
       OR (SELECT default_unit FROM exercises WHERE code = 'adductorSqueeze') <> 'SECONDS'
    THEN RAISE EXCEPTION 'V34: isometric units must be SECONDS'; END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants
        WHERE code LIKE 'copenhagenPlank%Bench'
        AND (resistance_source <> 'BODYWEIGHT' OR required_facility <> 'BENCH' OR contraction_type <> 'ISOMETRIC')
    ) THEN RAISE EXCEPTION 'V34: invalid Copenhagen equipment, facility or unit'; END IF;
END $$;
