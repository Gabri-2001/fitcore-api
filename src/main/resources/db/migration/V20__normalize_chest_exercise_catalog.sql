-- FitCore V20: chest catalogue expansion. Append-only for existing exercise and variant IDs.
-- 19 new variants + stable preferred variants for all exercise families.
-- No historical plans, sessions, IDs or existing variant codes are deleted or renamed.

-- In the original V1 schema the CHECK constraint lacked LOW_INCLINE/HIGH_INCLINE,
-- even though these members already exist in the Java BenchAngle enum.
ALTER TABLE exercise_variants
    DROP CONSTRAINT IF EXISTS exercise_variants_bench_angle_check;
ALTER TABLE exercise_variants
    ADD CONSTRAINT exercise_variants_bench_angle_check
    CHECK (bench_angle IN (
        'FLAT', 'LOW_INCLINE', 'INCLINE', 'HIGH_INCLINE', 'DECLINE',
        'UPRIGHT', 'NOT_APPLICABLE'
    ));

-- Explicit preferred configuration. The frontend already reads defaultVariant.
ALTER TABLE exercise_variants
    ADD COLUMN is_default boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN exercise_variants.is_default IS
    'Preferred catalogue variant for preselection; not an exercise prescription.';

-- Preserve existing variants and add distinct technical executions only.
-- Each row refers to an existing canonical Exercise.code.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    created_at, updated_at
)
SELECT seed.code, seed.name, exercise.id, seed.equipment, seed.grip_type,
       seed.grip_width, seed.bench_angle, seed.body_position, seed.laterality,
       seed.trajectory, seed.support_type, seed.stance_type, seed.attachment_type,
       seed.shoulder_position, seed.foot_placement, seed.knee_position,
       seed.contraction_type, seed.requires_caution, true, seed.primary_focus,
       seed.secondary_focus, seed.practicality, seed.focus_description,
       seed.focus_evidence_type, seed.focus_evidence_level,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES

    ('benchPressBarbellInclineMediumGrip', 'Press de banca inclinado con barra, agarre medio', 'benchPress', 'BARBELL', 'PRONATED', 'MEDIUM', 'INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressDumbbellInclineNeutralGrip', 'Press inclinado con mancuernas, agarre neutro', 'benchPress', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressDumbbellInclinePronatedGrip', 'Press inclinado con mancuernas, agarre prono', 'benchPress', 'DUMBBELL', 'PRONATED', 'MEDIUM', 'INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressSmithFlatMediumGrip', 'Press de banca plano en Smith', 'benchPress', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'FLAT', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_STERNAL_BIAS', 'TRICEPS_BIAS', 'MACHINE_DEPENDENT', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressSmithInclineMediumGrip', 'Press de banca inclinado en Smith', 'benchPress', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'MACHINE_DEPENDENT', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressBarbellDeclineMediumGrip', 'Press de banca declinado con barra', 'benchPress', 'BARBELL', 'PRONATED', 'MEDIUM', 'DECLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_LOWER_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressDumbbellDeclineNeutralGrip', 'Press declinado con mancuernas, agarre neutro', 'benchPress', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'DECLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_LOWER_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressDumbbellFlatPronatedGrip', 'Press plano con mancuernas, agarre prono', 'benchPress', 'DUMBBELL', 'PRONATED', 'MEDIUM', 'FLAT', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_STERNAL_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressBarbellLowInclineMediumGrip', 'Press de banca con barra, inclinación ligera', 'benchPress', 'BARBELL', 'PRONATED', 'MEDIUM', 'LOW_INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'Press con mancuernas, inclinación ligera, agarre neutro', 'benchPress', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'LOW_INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'COMMON', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('benchPressSmithLowInclineMediumGrip', 'Press en Smith con inclinación ligera', 'benchPress', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'LOW_INCLINE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'MACHINE_DEPENDENT', 'Empuje de pecho; énfasis aproximado dependiente del ángulo y de la ejecución.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestFlyDumbbellFlat', 'Aperturas planas con mancuernas', 'chestFly', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'FLAT', 'SUPINE', 'BILATERAL', 'HORIZONTAL', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ABDUCTED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_STERNAL_BIAS', NULL, 'COMMON', 'Aducción horizontal del hombro; orientación muscular aproximada según ángulo o trayectoria.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestFlyDumbbellIncline', 'Aperturas inclinadas con mancuernas', 'chestFly', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'INCLINE', 'SUPINE', 'BILATERAL', 'HORIZONTAL', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ABDUCTED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', NULL, 'COMMON', 'Aducción horizontal del hombro; orientación muscular aproximada según ángulo o trayectoria.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestFlyCableLowToHigh', 'Aperturas en polea de abajo hacia arriba', 'chestFly', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', NULL, 'COMMON', 'Aducción horizontal del hombro; orientación muscular aproximada según ángulo o trayectoria.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestFlyCableHighToLow', 'Aperturas en polea de arriba hacia abajo', 'chestFly', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'CHEST_LOWER_BIAS', NULL, 'COMMON', 'Aducción horizontal del hombro; orientación muscular aproximada según ángulo o trayectoria.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestFlyCableSeated', 'Aperturas sentadas con poleas', 'chestFly', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'HORIZONTAL', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'D_HANDLE', 'ABDUCTED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_STERNAL_BIAS', NULL, 'COMMON', 'Aducción horizontal del hombro; orientación muscular aproximada según ángulo o trayectoria.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestPressMachineInclinePronatedMediumGrip', 'Press de pecho inclinado en máquina, agarre prono', 'machineChestPress', 'MACHINE_PLATE_LOADED', 'PRONATED', 'MEDIUM', 'INCLINE', 'SEATED', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_CLAVICULAR_BIAS', 'TRICEPS_BIAS', 'MACHINE_DEPENDENT', 'Empuje guiado de pecho; sesgo aproximado según el ángulo y recorrido de la máquina.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'Press de pecho declinado en máquina, agarre prono', 'machineChestPress', 'MACHINE_PLATE_LOADED', 'PRONATED', 'MEDIUM', 'DECLINE', 'SEATED', 'BILATERAL', 'HORIZONTAL', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_LOWER_BIAS', 'TRICEPS_BIAS', 'MACHINE_DEPENDENT', 'Empuje guiado de pecho; sesgo aproximado según el ángulo y recorrido de la máquina.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'Press de pecho plano en máquina de discos, agarre neutro', 'machineChestPress', 'MACHINE_PLATE_LOADED', 'NEUTRAL', 'MEDIUM', 'FLAT', 'SEATED', 'BILATERAL', 'HORIZONTAL', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'CHEST_STERNAL_BIAS', 'TRICEPS_BIAS', 'MACHINE_DEPENDENT', 'Empuje guiado de pecho; sesgo aproximado según el ángulo y recorrido de la máquina.', 'BIOMECHANICAL_INFERENCE', 'MEDIUM')

) AS seed(
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level
)
JOIN exercises exercise ON exercise.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- The prior chest presets remain valid; set one stable recommended default per
-- exercise rather than relying on lexical ordering of variant codes.
UPDATE exercise_variants
SET is_default = false
WHERE exercise_id IN (SELECT id FROM exercises WHERE main_muscle_group = 'CHEST');

UPDATE exercise_variants
SET is_default = true
WHERE active = true AND code IN (
    'benchPressBarbellFlatMediumGrip',
    'chestPressMachinePronatedMediumGrip',
    'chestFlyPecDeckSeated',
    'pushUpStandard',
    'dipBodyweightForwardLean'
);

-- For other exercise families, choose one active variant deterministically,
-- but never overwrite an explicitly designated default.
WITH ranked AS (
    SELECT v.id, ROW_NUMBER() OVER (
        PARTITION BY v.exercise_id
        ORDER BY CASE v.practicality WHEN 'COMMON' THEN 0 ELSE 1 END,
                 v.name ASC, v.code ASC
    ) AS ordinal
    FROM exercise_variants v
    WHERE v.active = true
      AND NOT EXISTS (
          SELECT 1 FROM exercise_variants existing
          WHERE existing.exercise_id = v.exercise_id
            AND existing.active = true AND existing.is_default = true
      )
)
UPDATE exercise_variants target
SET is_default = true
FROM ranked
WHERE target.id = ranked.id AND ranked.ordinal = 1;

CREATE UNIQUE INDEX uk_one_active_default_variant_per_exercise
    ON exercise_variants (exercise_id)
    WHERE is_default = true AND active = true;

-- Explicit regional/functional activation mapping for each new variant.
-- Roles (3/2/1) are qualitative. Evidence is BIOMECHANICAL_INFERENCE,
-- NOT a measured EMG percentage; the shoulder/chest emphasis is approximate.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale,
    created_at, updated_at
)
SELECT variant.id, muscle.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3
                      WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE WHEN seed.evidence_level = 'LOW' THEN 'REVIEW' ELSE 'MEDIUM' END,
       'BIOMECHANICAL_INFERENCE', NULL, 4,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Inferencia biomecanica orientativa por angulo, trayectoria y material; no equivale a un porcentaje EMG.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES

    ('benchPressBarbellInclineMediumGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressBarbellInclineMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressBarbellInclineMediumGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressBarbellInclineMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressBarbellInclineMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressBarbellInclineMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellInclineMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellInclineMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressDumbbellInclineNeutralGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclineNeutralGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressDumbbellInclinePronatedGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellInclinePronatedGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'PECTORAL_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('benchPressSmithFlatMediumGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithFlatMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressSmithInclineMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithInclineMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'PECTORAL_LOWER', 'PRIMARY', 'MEDIUM'),
    ('benchPressBarbellDeclineMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellDeclineMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'PECTORAL_LOWER', 'PRIMARY', 'MEDIUM'),
    ('benchPressDumbbellDeclineNeutralGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellDeclineNeutralGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'PECTORAL_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('benchPressDumbbellFlatPronatedGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellFlatPronatedGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressBarbellLowInclineMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressBarbellLowInclineMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressDumbbellLowInclineNeutralGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('benchPressSmithLowInclineMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('benchPressSmithLowInclineMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellFlat', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellFlat', 'PECTORAL_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('chestFlyDumbbellFlat', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellFlat', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellFlat', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestFlyDumbbellIncline', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('chestFlyDumbbellIncline', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellIncline', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellIncline', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestFlyDumbbellIncline', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestFlyCableLowToHigh', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('chestFlyCableLowToHigh', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('chestFlyCableLowToHigh', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('chestFlyCableLowToHigh', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestFlyCableLowToHigh', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestFlyCableLowToHigh', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('chestFlyCableHighToLow', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('chestFlyCableHighToLow', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('chestFlyCableHighToLow', 'PECTORAL_LOWER', 'PRIMARY', 'MEDIUM'),
    ('chestFlyCableHighToLow', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestFlyCableHighToLow', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestFlyCableHighToLow', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('chestFlyCableSeated', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('chestFlyCableSeated', 'PECTORAL_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('chestFlyCableSeated', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('chestFlyCableSeated', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestFlyCableSeated', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'PECTORAL_UPPER', 'PRIMARY', 'MEDIUM'),
    ('chestPressMachineInclinePronatedMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachineInclinePronatedMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'PECTORAL_LOWER', 'PRIMARY', 'MEDIUM'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachineDeclinePronatedMediumGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'PECTORAL_UPPER', 'SECONDARY', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'PECTORAL_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'PECTORAL_LOWER', 'SECONDARY', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('chestPressMachinePlateLoadedFlatNeutralGrip', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW')

) AS seed(variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

-- Fail the migration atomically if an expected canonical seed was missing.
DO $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM exercise_variants v
        JOIN exercises e ON e.id = v.exercise_id
        WHERE e.main_muscle_group = 'CHEST'
    ) < 31 THEN
        RAISE EXCEPTION 'V20: expected at least 31 chest variants after seeding';
    END IF;
    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        JOIN exercises e ON e.id = v.exercise_id
        WHERE e.main_muscle_group = 'CHEST'
        GROUP BY e.id HAVING COUNT(*) FILTER (WHERE v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V20: each chest exercise must have exactly one active default';
    END IF;
END $$;

