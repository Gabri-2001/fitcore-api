-- FitCore V21: normalizacion y ampliacion del catalogo de espalda.
-- 13 variantes nuevas sobre 7 ejercicios base existentes; no se crean familias
-- artificiales ni se duplican las 9 dominadas y 9 jalones de agarre ya existentes.
-- No se borran ni se renombran codigos o IDs historicos.
-- Los niveles musculares son cualitativos: NO son porcentajes EMG medidos.

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
       'BIOMECHANICAL_INFERENCE', 'MEDIUM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('latPulldownSingleArmKneelingNeutralGrip', 'Jalón unilateral en polea en posición de medio arrodillado', 'latPulldown', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'HALF_KNEELING', 'UNILATERAL', 'TO_HIP', 'FREE', 'STAGGERED', 'D_HANDLE', 'ARMS_OVERHEAD', 'MEDIUM', 'FLEXED', 'DYNAMIC', false, 'LAT_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Jalón unilateral con énfasis práctico en extensión y aducción del hombro; el sesgo depende de la trayectoria.'),
    ('seatedCableRowPronatedWideGrip', 'Remo sentado en polea con agarre prono ancho', 'seatedCableRow', 'CABLE', 'PRONATED', 'WIDE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_CHEST', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'LAT_BAR', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'UPPER_BACK_BIAS', 'BACK_THICKNESS', 'COMMON', 'Remo con codos relativamente abiertos hacia el pecho, con trabajo escapular importante.'),
    ('seatedCableRowSupinatedMediumGrip', 'Remo sentado en polea con agarre supino medio', 'seatedCableRow', 'CABLE', 'SUPINATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_ABDOMEN', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'STRAIGHT_BAR', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'LAT_BIAS', 'BICEPS_BIAS', 'COMMON', 'Remo en polea con agarre supino; no implica aislamiento del dorsal ni del bíceps.'),
    ('seatedCableRowSingleArmNeutralGrip', 'Remo sentado unilateral en polea con agarre neutro', 'seatedCableRow', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'TO_HIP', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'D_HANDLE', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'LAT_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Remo unilateral sentado con asa individual y control de la rotación del tronco.'),
    ('machineRowSelectorisedNeutralMediumGrip', 'Remo en máquina selectorizada con agarre neutro medio', 'machineRow', 'MACHINE_SELECTORISED', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_ABDOMEN', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'BACK_THICKNESS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Remo guiado de recorrido dependiente de la geometría de la máquina.'),
    ('machineRowUnilateralNeutralGrip', 'Remo unilateral en máquina de discos con agarre neutro', 'machineRow', 'MACHINE_PLATE_LOADED', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'TO_HIP', 'CHEST_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'LAT_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Remo con apoyo torácico y ejecución unilateral; la trayectoria depende de la máquina.'),
    ('barbellRowPronatedWideGripToUpperChest', 'Remo inclinado con barra, agarre prono ancho hacia el pecho alto', 'barbellRow', 'BARBELL', 'PRONATED', 'WIDE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'TO_UPPER_CHEST', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'UPPER_BACK_BIAS', 'BACK_THICKNESS', 'TECHNIQUE_DEPENDENT', 'Remo con codos más abiertos; requiere control lumbar y no garantiza mayor activación cuantificable.'),
    ('barbellRowPronatedMediumGripToHip', 'Remo inclinado con barra, agarre prono medio hacia la cadera', 'barbellRow', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'TO_HIP', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'LAT_BIAS', 'BACK_THICKNESS', 'TECHNIQUE_DEPENDENT', 'Remo de codos próximos al torso y trayectoria baja, con sesgo práctico hacia el dorsal.'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'Remo unilateral libre con mancuerna y agarre neutro', 'oneArmDumbbellRow', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'TO_HIP', 'FREE', 'STAGGERED', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'LAT_BIAS', 'UNILATERAL_STABILITY', 'TECHNIQUE_DEPENDENT', 'Remo unilateral sin apoyo; mayor necesidad de estabilidad del tronco.'),
    ('oneArmDumbbellRowChestSupportedIncline', 'Remo unilateral con mancuerna y pecho apoyado en banco inclinado', 'oneArmDumbbellRow', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'INCLINE', 'CHEST_SUPPORTED', 'UNILATERAL', 'TO_HIP', 'CHEST_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'LAT_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Remo unilateral con apoyo torácico que reduce las demandas del tronco.'),
    ('straightArmPulldownCableSingleArm', 'Jalón de brazos rectos unilateral con asa', 'straightArmPulldown', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'TO_HIP', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_OVERHEAD', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'LAT_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Extensión unilateral del hombro con codo casi fijo; sin interpretar activaciones como porcentajes EMG.'),
    ('shrugDumbbellStanding', 'Encogimientos de hombros de pie con mancuernas', 'shrug', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SCAPULAR_CONTROL', 'GRIP_STRENGTH', 'COMMON', 'Elevación escapular con peso libre; enfoque práctico en trapecio superior.'),
    ('shrugMachineStanding', 'Encogimientos de hombros en máquina de discos', 'shrug', 'MACHINE_PLATE_LOADED', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'SCAPULAR_CONTROL', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Elevación escapular guiada, dependiente del equipamiento disponible.')
) AS seed(
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, primary_focus, secondary_focus,
    practicality, focus_description
)
JOIN exercises exercise ON exercise.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- V20 ya garantiza como maximo un default activo por ejercicio mediante
-- indice unico parcial. Fijamos referencias canonicas de espalda sin tocar
-- la predeterminacion del resto de grupos musculares.
UPDATE exercise_variants
SET is_default = false, updated_at = CURRENT_TIMESTAMP
WHERE exercise_id IN (
    SELECT id FROM exercises WHERE main_muscle_group = 'BACK'
) AND is_default = true;

UPDATE exercise_variants
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE active = true AND code IN (
    'pullUpBodyweightPronatedMediumGrip',
    'latPulldownPronatedMediumGripToChest',
    'seatedCableRowNeutralGrip',
    'straightArmPulldownCableRope',
    'machineRowNeutralNarrowGrip',
    'barbellRowPronatedMediumGrip',
    'oneArmDumbbellRowBenchSupported',
    'shrugBarbellStanding'
);

-- Todas las nuevas variantes disponen de activaciones propias.
-- Confidence y evidence_level etiquetan grado de incertidumbre, no intensidad.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale,
    created_at, updated_at
)
SELECT variant.id, muscle.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL,
       CASE seed.evidence_level WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 5,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Clasificacion cualitativa orientativa por trayectoria, agarre y apoyo. No es un valor EMG ni demuestra aislamiento.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('latPulldownSingleArmKneelingNeutralGrip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('latPulldownSingleArmKneelingNeutralGrip', 'TERES_MAJOR', 'SECONDARY', 'LOW'),
    ('latPulldownSingleArmKneelingNeutralGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('latPulldownSingleArmKneelingNeutralGrip', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('latPulldownSingleArmKneelingNeutralGrip', 'TRAPEZIUS_LOWER', 'SECONDARY', 'LOW'),
    ('latPulldownSingleArmKneelingNeutralGrip', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('seatedCableRowPronatedWideGrip', 'TRAPEZIUS_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('seatedCableRowPronatedWideGrip', 'RHOMBOIDS_REGION', 'PRIMARY', 'MEDIUM'),
    ('seatedCableRowPronatedWideGrip', 'DELTOID_POSTERIOR', 'SECONDARY', 'LOW'),
    ('seatedCableRowPronatedWideGrip', 'LATISSIMUS_DORSI', 'SECONDARY', 'LOW'),
    ('seatedCableRowPronatedWideGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('seatedCableRowPronatedWideGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('seatedCableRowSupinatedMediumGrip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('seatedCableRowSupinatedMediumGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('seatedCableRowSupinatedMediumGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('seatedCableRowSupinatedMediumGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('seatedCableRowSupinatedMediumGrip', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('seatedCableRowSupinatedMediumGrip', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('seatedCableRowSingleArmNeutralGrip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('seatedCableRowSingleArmNeutralGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('seatedCableRowSingleArmNeutralGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('seatedCableRowSingleArmNeutralGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('seatedCableRowSingleArmNeutralGrip', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('seatedCableRowSingleArmNeutralGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('machineRowSelectorisedNeutralMediumGrip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('machineRowSelectorisedNeutralMediumGrip', 'RHOMBOIDS_REGION', 'PRIMARY', 'MEDIUM'),
    ('machineRowSelectorisedNeutralMediumGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('machineRowSelectorisedNeutralMediumGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('machineRowSelectorisedNeutralMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('machineRowUnilateralNeutralGrip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('machineRowUnilateralNeutralGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('machineRowUnilateralNeutralGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('machineRowUnilateralNeutralGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('machineRowUnilateralNeutralGrip', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('machineRowUnilateralNeutralGrip', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('barbellRowPronatedWideGripToUpperChest', 'TRAPEZIUS_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('barbellRowPronatedWideGripToUpperChest', 'RHOMBOIDS_REGION', 'PRIMARY', 'MEDIUM'),
    ('barbellRowPronatedWideGripToUpperChest', 'DELTOID_POSTERIOR', 'SECONDARY', 'LOW'),
    ('barbellRowPronatedWideGripToUpperChest', 'LATISSIMUS_DORSI', 'SECONDARY', 'LOW'),
    ('barbellRowPronatedWideGripToUpperChest', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('barbellRowPronatedWideGripToUpperChest', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('barbellRowPronatedMediumGripToHip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('barbellRowPronatedMediumGripToHip', 'TERES_MAJOR', 'SECONDARY', 'LOW'),
    ('barbellRowPronatedMediumGripToHip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('barbellRowPronatedMediumGripToHip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('barbellRowPronatedMediumGripToHip', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('oneArmDumbbellRowFreeNeutralGrip', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('oneArmDumbbellRowChestSupportedIncline', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('oneArmDumbbellRowChestSupportedIncline', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('oneArmDumbbellRowChestSupportedIncline', 'RHOMBOIDS_REGION', 'SECONDARY', 'LOW'),
    ('oneArmDumbbellRowChestSupportedIncline', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('oneArmDumbbellRowChestSupportedIncline', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('straightArmPulldownCableSingleArm', 'LATISSIMUS_DORSI', 'PRIMARY', 'MEDIUM'),
    ('straightArmPulldownCableSingleArm', 'TERES_MAJOR', 'SECONDARY', 'LOW'),
    ('straightArmPulldownCableSingleArm', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('straightArmPulldownCableSingleArm', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('straightArmPulldownCableSingleArm', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('shrugDumbbellStanding', 'TRAPEZIUS_UPPER', 'PRIMARY', 'MEDIUM'),
    ('shrugDumbbellStanding', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('shrugDumbbellStanding', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('shrugDumbbellStanding', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('shrugMachineStanding', 'TRAPEZIUS_UPPER', 'PRIMARY', 'MEDIUM'),
    ('shrugMachineStanding', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'LOW'),
    ('shrugMachineStanding', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW')
) AS seed(variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

-- Evitar migraciones aparentemente exitosas si falta una familia, variante,
-- musculo o configuracion predeterminada.
DO $$
DECLARE
    seeded_variants integer;
    seeded_muscles integer;
BEGIN
    SELECT COUNT(*) INTO seeded_variants FROM exercise_variants
    WHERE code IN (
        'latPulldownSingleArmKneelingNeutralGrip',
        'seatedCableRowPronatedWideGrip',
        'seatedCableRowSupinatedMediumGrip',
        'seatedCableRowSingleArmNeutralGrip',
        'machineRowSelectorisedNeutralMediumGrip',
        'machineRowUnilateralNeutralGrip',
        'barbellRowPronatedWideGripToUpperChest',
        'barbellRowPronatedMediumGripToHip',
        'oneArmDumbbellRowFreeNeutralGrip',
        'oneArmDumbbellRowChestSupportedIncline',
        'straightArmPulldownCableSingleArm',
        'shrugDumbbellStanding',
        'shrugMachineStanding'
    );
    IF seeded_variants <> 13 THEN
        RAISE EXCEPTION 'V21: expected 13 new back variants, found %', seeded_variants;
    END IF;

    SELECT COUNT(*) INTO seeded_muscles
    FROM exercise_muscle_activations a
    JOIN exercise_variants v ON v.id = a.exercise_variant_id
    WHERE v.code IN (
        'latPulldownSingleArmKneelingNeutralGrip',
        'seatedCableRowPronatedWideGrip',
        'seatedCableRowSupinatedMediumGrip',
        'seatedCableRowSingleArmNeutralGrip',
        'machineRowSelectorisedNeutralMediumGrip',
        'machineRowUnilateralNeutralGrip',
        'barbellRowPronatedWideGripToUpperChest',
        'barbellRowPronatedMediumGripToHip',
        'oneArmDumbbellRowFreeNeutralGrip',
        'oneArmDumbbellRowChestSupportedIncline',
        'straightArmPulldownCableSingleArm',
        'shrugDumbbellStanding',
        'shrugMachineStanding'
    ) AND a.mapping_version = 5;
    IF seeded_muscles <> 69 THEN
        RAISE EXCEPTION 'V21: expected 69 activation mappings, found %', seeded_muscles;
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        WHERE v.code IN (
        'latPulldownSingleArmKneelingNeutralGrip',
        'seatedCableRowPronatedWideGrip',
        'seatedCableRowSupinatedMediumGrip',
        'seatedCableRowSingleArmNeutralGrip',
        'machineRowSelectorisedNeutralMediumGrip',
        'machineRowUnilateralNeutralGrip',
        'barbellRowPronatedWideGripToUpperChest',
        'barbellRowPronatedMediumGripToHip',
        'oneArmDumbbellRowFreeNeutralGrip',
        'oneArmDumbbellRowChestSupportedIncline',
        'straightArmPulldownCableSingleArm',
        'shrugDumbbellStanding',
        'shrugMachineStanding'
        ) AND NOT EXISTS (
            SELECT 1 FROM exercise_muscle_activations a
            WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
        )
    ) THEN
        RAISE EXCEPTION 'V21: all new back variants must have a primary muscle';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        JOIN exercises e ON e.id = v.exercise_id
        WHERE e.main_muscle_group = 'BACK'
        GROUP BY e.id
        HAVING COUNT(*) FILTER (WHERE v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V21: each back exercise must have exactly one active default';
    END IF;

    IF (SELECT COUNT(*) FROM exercise_variants v
        JOIN exercises e ON e.id = v.exercise_id
        WHERE e.code = 'pullUp') <> 9 THEN
        RAISE EXCEPTION 'V21: the existing 9 pull-up variants must be preserved';
    END IF;
END $$;
