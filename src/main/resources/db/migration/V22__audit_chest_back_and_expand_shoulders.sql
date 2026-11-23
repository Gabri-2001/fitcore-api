-- FitCore V22: audit corrections for chest/back + shoulder variant expansion.
-- Migrates forward only. All prior variant IDs/codes and historical logs are preserved.
-- Anatomical roles are qualitative biomechanical inferences, not measured EMG percentages.

-- The V1 schema predates these values already present in the Java enums.
-- Keep PostgreSQL validation synchronized with BodyPosition and Trajectory.
ALTER TABLE exercise_variants DROP CONSTRAINT IF EXISTS exercise_variants_body_position_check;
ALTER TABLE exercise_variants ADD CONSTRAINT exercise_variants_body_position_check
    CHECK (body_position IN (
        'STANDING','SEATED','SUPINE','PRONE','CHEST_SUPPORTED','BENT_OVER',
        'INCLINE_PRONE','KNEELING','HALF_KNEELING','HANGING','QUADRUPED',
        'SIDE_LYING','NOT_APPLICABLE'
    ));
ALTER TABLE exercise_variants DROP CONSTRAINT IF EXISTS exercise_variants_trajectory_check;
ALTER TABLE exercise_variants ADD CONSTRAINT exercise_variants_trajectory_check
    CHECK (trajectory IN (
        'TO_CHEST','TO_UPPER_CHEST','TO_HIP','TO_ABDOMEN','TO_FACE',
        'LOW_TO_HIGH','HIGH_TO_LOW','ARC','OVERHEAD','DOWNWARD','UPWARD',
        'HORIZONTAL','ROTATIONAL','NOT_APPLICABLE'
    ));

-- The upright chest/triceps dip does not use a bench. Previously 'UPRIGHT'
-- was mistakenly stored in bench_angle; the execution remains distinguished
-- by its stable variant code, name and primary_focus. 
UPDATE exercise_variants
SET bench_angle = 'NOT_APPLICABLE', updated_at = CURRENT_TIMESTAMP
WHERE code = 'dipBodyweightUpright' AND bench_angle = 'UPRIGHT';

-- Add 13 practical shoulder executions within the five existing base families.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    created_at, updated_at
)
SELECT seed.code, seed.name, ex.id, seed.equipment, seed.grip_type,
       seed.grip_width, seed.bench_angle, seed.body_position, seed.laterality,
       seed.trajectory, seed.support_type, seed.stance_type, seed.attachment_type,
       seed.shoulder_position, seed.foot_placement, seed.knee_position,
       seed.contraction_type, seed.requires_caution, true, seed.primary_focus,
       seed.secondary_focus, seed.practicality, seed.focus_description,
       'BIOMECHANICAL_INFERENCE', 'MEDIUM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('overheadPressDumbbellStanding', 'Press de hombros de pie con mancuernas', 'overheadPress', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'OVERHEAD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SHOULDER_STRENGTH', 'TRICEPS_BIAS', 'COMMON', 'Press vertical libre; estabilidad del tronco y recorrido dependen de la técnica.'),
    ('overheadPressDumbbellSeated', 'Press de hombros sentado con mancuernas', 'overheadPress', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'OVERHEAD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SHOULDER_STRENGTH', 'TRICEPS_BIAS', 'COMMON', 'Press vertical sentado con apoyo; el grado de soporte depende del banco.'),
    ('overheadPressSmithSeated', 'Press de hombros sentado en Smith', 'overheadPress', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'OVERHEAD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SHOULDER_STRENGTH', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Trayectoria guiada por multipower; la geometría de la máquina condiciona el recorrido.'),
    ('overheadPressMachineSeated', 'Press de hombros en máquina selectorizada', 'overheadPress', 'MACHINE_SELECTORISED', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'OVERHEAD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SHOULDER_STRENGTH', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Press de hombros guiado, con trayectoria y ajuste propios de cada máquina.'),
    ('lateralRaiseCableUnilateralStanding', 'Elevación lateral unilateral de pie en polea', 'lateralRaise', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ARC', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SIDE_DELTS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Abducción unilateral del hombro; control escapular durante el recorrido.'),
    ('lateralRaiseMachineSeated', 'Elevación lateral sentado en máquina', 'lateralRaise', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'ARC', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ABDUCTED', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SIDE_DELTS_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Abducción del hombro con recorrido definido por la máquina.'),
    ('lateralRaiseDumbbellSeated', 'Elevación lateral sentado con mancuernas', 'lateralRaise', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'ARC', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ABDUCTED', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SIDE_DELTS_BIAS', NULL, 'COMMON', 'Abducción del hombro con carga libre; no garantiza aislamiento muscular.'),
    ('frontRaiseCableStanding', 'Elevación frontal de pie en polea', 'frontRaise', 'CABLE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'STRAIGHT_BAR', 'ARMS_IN_FRONT', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SHOULDER_STRENGTH', NULL, 'COMMON', 'Flexión de hombro en polea con barra recta, manteniendo control del tronco.'),
    ('frontRaisePlateStanding', 'Elevación frontal de pie con disco', 'frontRaise', 'WEIGHT_PLATE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SHOULDER_STRENGTH', NULL, 'COMMON', 'Flexión bilateral del hombro sujetando un disco; coordinación de hombros y tronco.'),
    ('rearDeltFlyDumbbellBentOver', 'Aperturas de deltoide posterior inclinado con mancuernas', 'rearDeltFly', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'BENT_OVER', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'REAR_DELTS_BIAS', 'UPPER_BACK_BIAS', 'TECHNIQUE_DEPENDENT', 'Abducción horizontal con torso flexionado; requiere controlar la postura.'),
    ('rearDeltFlyCableStanding', 'Aperturas de deltoide posterior de pie en polea', 'rearDeltFly', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'REAR_DELTS_BIAS', 'UPPER_BACK_BIAS', 'COMMON', 'Abducción horizontal con poleas, con resistencia dependiente de los puntos de anclaje.'),
    ('rearDeltFlyDumbbellChestSupportedIncline', 'Aperturas de deltoide posterior con pecho apoyado en banco inclinado', 'rearDeltFly', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'INCLINE', 'INCLINE_PRONE', 'BILATERAL', 'HORIZONTAL', 'CHEST_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ABDUCTED', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'REAR_DELTS_BIAS', 'UPPER_BACK_BIAS', 'COMMON', 'Abducción horizontal con apoyo torácico sobre banco inclinado.'),
    ('facePullBandStanding', 'Face pull de pie con banda elástica', 'facePull', 'BAND', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'TO_FACE', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'REAR_DELTS_BIAS', 'SCAPULAR_CONTROL', 'COMMON', 'Tracción con banda hacia la cara; tensión dependiente del estiramiento de la banda.')
) AS seed (
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, primary_focus, secondary_focus,
    practicality, focus_description
)
JOIN exercises ex ON ex.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- One explicit standard variant per shoulder exercise, rather than a
-- default chosen alphabetically; preserve all historical variant IDs.
UPDATE exercise_variants
SET is_default = false, updated_at = CURRENT_TIMESTAMP
WHERE is_default = true AND exercise_id IN (
    SELECT id FROM exercises WHERE main_muscle_group = 'SHOULDERS'
);
UPDATE exercise_variants
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE active = true AND code IN (
    'overheadPressBarbellStanding',
    'lateralRaiseDumbbellStanding',
    'frontRaiseDumbbellStanding',
    'rearDeltFlyMachineSeated',
    'facePullCableRope'
);

-- Qualitative primary/secondary/stabilizing muscle roles. Avoid invented
-- precise activation percentages and source identifiers.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale,
    created_at, updated_at
)
SELECT variant.id, muscle.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE WHEN seed.evidence_level = 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 6,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Rol muscular cualitativo inferido por anatomía y ejecución. No implica aislamiento ni porcentajes EMG.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('overheadPressDumbbellStanding', 'DELTOID_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('overheadPressDumbbellStanding', 'DELTOID_LATERAL', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellStanding', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellStanding', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellStanding', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellStanding', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('overheadPressDumbbellSeated', 'DELTOID_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('overheadPressDumbbellSeated', 'DELTOID_LATERAL', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellSeated', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellSeated', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellSeated', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('overheadPressDumbbellSeated', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('overheadPressSmithSeated', 'DELTOID_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('overheadPressSmithSeated', 'DELTOID_LATERAL', 'SECONDARY', 'LOW'),
    ('overheadPressSmithSeated', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressSmithSeated', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressSmithSeated', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('overheadPressSmithSeated', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('overheadPressMachineSeated', 'DELTOID_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('overheadPressMachineSeated', 'DELTOID_LATERAL', 'SECONDARY', 'LOW'),
    ('overheadPressMachineSeated', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressMachineSeated', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadPressMachineSeated', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('lateralRaiseCableUnilateralStanding', 'DELTOID_LATERAL', 'PRIMARY', 'MEDIUM'),
    ('lateralRaiseCableUnilateralStanding', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('lateralRaiseCableUnilateralStanding', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('lateralRaiseCableUnilateralStanding', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('lateralRaiseCableUnilateralStanding', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('lateralRaiseMachineSeated', 'DELTOID_LATERAL', 'PRIMARY', 'MEDIUM'),
    ('lateralRaiseMachineSeated', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('lateralRaiseMachineSeated', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('lateralRaiseMachineSeated', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('lateralRaiseDumbbellSeated', 'DELTOID_LATERAL', 'PRIMARY', 'MEDIUM'),
    ('lateralRaiseDumbbellSeated', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('lateralRaiseDumbbellSeated', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('lateralRaiseDumbbellSeated', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('frontRaiseCableStanding', 'DELTOID_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('frontRaiseCableStanding', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('frontRaiseCableStanding', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('frontRaiseCableStanding', 'SERRATUS_ANTERIOR', 'STABILIZER', 'LOW'),
    ('frontRaisePlateStanding', 'DELTOID_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('frontRaisePlateStanding', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('frontRaisePlateStanding', 'TRAPEZIUS_UPPER', 'SECONDARY', 'LOW'),
    ('frontRaisePlateStanding', 'SERRATUS_ANTERIOR', 'STABILIZER', 'LOW'),
    ('rearDeltFlyDumbbellBentOver', 'DELTOID_POSTERIOR', 'PRIMARY', 'MEDIUM'),
    ('rearDeltFlyDumbbellBentOver', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('rearDeltFlyDumbbellBentOver', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('rearDeltFlyDumbbellBentOver', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('rearDeltFlyDumbbellBentOver', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('rearDeltFlyCableStanding', 'DELTOID_POSTERIOR', 'PRIMARY', 'MEDIUM'),
    ('rearDeltFlyCableStanding', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('rearDeltFlyCableStanding', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('rearDeltFlyCableStanding', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('rearDeltFlyDumbbellChestSupportedIncline', 'DELTOID_POSTERIOR', 'PRIMARY', 'MEDIUM'),
    ('rearDeltFlyDumbbellChestSupportedIncline', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('rearDeltFlyDumbbellChestSupportedIncline', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('rearDeltFlyDumbbellChestSupportedIncline', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('facePullBandStanding', 'DELTOID_POSTERIOR', 'PRIMARY', 'MEDIUM'),
    ('facePullBandStanding', 'TRAPEZIUS_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('facePullBandStanding', 'TRAPEZIUS_LOWER', 'SECONDARY', 'LOW'),
    ('facePullBandStanding', 'INFRASPINATUS', 'SECONDARY', 'LOW'),
    ('facePullBandStanding', 'BICEPS_BRACHII', 'SECONDARY', 'LOW')
) AS seed (variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

-- Fail Flyway visibly if any of the expected new references were not seeded.
DO $$
DECLARE
    total_new integer;
    total_mappings integer;
    shoulder_total integer;
BEGIN
    SELECT COUNT(*) INTO total_new FROM exercise_variants WHERE code IN ('overheadPressDumbbellStanding', 'overheadPressDumbbellSeated', 'overheadPressSmithSeated', 'overheadPressMachineSeated', 'lateralRaiseCableUnilateralStanding', 'lateralRaiseMachineSeated', 'lateralRaiseDumbbellSeated', 'frontRaiseCableStanding', 'frontRaisePlateStanding', 'rearDeltFlyDumbbellBentOver', 'rearDeltFlyCableStanding', 'rearDeltFlyDumbbellChestSupportedIncline', 'facePullBandStanding');
    IF total_new <> 13 THEN
        RAISE EXCEPTION 'V22: expected 13 shoulder variants, found %', total_new;
    END IF;

    SELECT COUNT(*) INTO total_mappings
    FROM exercise_muscle_activations a
    JOIN exercise_variants v ON v.id = a.exercise_variant_id
    WHERE v.code IN ('overheadPressDumbbellStanding', 'overheadPressDumbbellSeated', 'overheadPressSmithSeated', 'overheadPressMachineSeated', 'lateralRaiseCableUnilateralStanding', 'lateralRaiseMachineSeated', 'lateralRaiseDumbbellSeated', 'frontRaiseCableStanding', 'frontRaisePlateStanding', 'rearDeltFlyDumbbellBentOver', 'rearDeltFlyCableStanding', 'rearDeltFlyDumbbellChestSupportedIncline', 'facePullBandStanding') AND a.mapping_version = 6;
    IF total_mappings <> 63 THEN
        RAISE EXCEPTION 'V22: expected 63 shoulder activation mappings, found %', total_mappings;
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        WHERE v.code IN ('overheadPressDumbbellStanding', 'overheadPressDumbbellSeated', 'overheadPressSmithSeated', 'overheadPressMachineSeated', 'lateralRaiseCableUnilateralStanding', 'lateralRaiseMachineSeated', 'lateralRaiseDumbbellSeated', 'frontRaiseCableStanding', 'frontRaisePlateStanding', 'rearDeltFlyDumbbellBentOver', 'rearDeltFlyCableStanding', 'rearDeltFlyDumbbellChestSupportedIncline', 'facePullBandStanding')
        AND NOT EXISTS (
            SELECT 1 FROM exercise_muscle_activations a
            WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
        )
    ) THEN
        RAISE EXCEPTION 'V22: shoulder variant without a primary muscle';
    END IF;

    SELECT COUNT(*) INTO shoulder_total
    FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
    WHERE e.main_muscle_group = 'SHOULDERS' AND v.active = true;
    IF shoulder_total <> 18 THEN
        RAISE EXCEPTION 'V22: expected 18 active shoulder variants, found %', shoulder_total;
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercises e
        WHERE e.main_muscle_group IN ('CHEST','BACK','SHOULDERS')
        AND EXISTS (SELECT 1 FROM exercise_variants v WHERE v.exercise_id = e.id AND v.active)
        AND (SELECT COUNT(*) FROM exercise_variants v
             WHERE v.exercise_id = e.id AND v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V22: ambiguous/missing active default in chest/back/shoulders';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v WHERE v.code = 'dipBodyweightUpright'
          AND v.bench_angle <> 'NOT_APPLICABLE'
    ) THEN
        RAISE EXCEPTION 'V22: upright dip still has a bench angle';
    END IF;
END $$;
