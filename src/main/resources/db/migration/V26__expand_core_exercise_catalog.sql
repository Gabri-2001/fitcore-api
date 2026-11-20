-- V26: core by movement pattern, no invented EMG percentages.
-- Historical IDs remain intact. Posterior pelvic tilt is needed for abdominal
-- emphasis in leg-raise variants; hip flexors are not faithfully drawn in SVG.

INSERT INTO exercises (
    code, name, exercise_category, main_muscle_group, movement_pattern,
    description, calories_estimation_type, base_calories_per_unit,
    default_unit, active, created_at, updated_at
)
VALUES
    ('reverseCrunch', 'Crunch inverso', 'CORE', 'CORE', 'TRUNK_FLEXION', 'Flexión de la pelvis sobre el tronco, con control lumbar.', 'REP_BASED', NULL, 'REPETITIONS', 'true', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('abWheel', 'Rueda abdominal', 'CORE', 'CORE', 'ANTI_EXTENSION', 'Deslizamiento de rueda en anti-extensión; progresión de rodillas a de pie.', 'REP_BASED', NULL, 'REPETITIONS', 'true', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidePlank', 'Plancha lateral', 'CORE', 'CORE', 'ANTI_LATERAL_FLEXION', 'Isometría de estabilidad lateral de tronco.', 'DURATION_BASED', NULL, 'SECONDS', 'true', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('woodchopper', 'Giro diagonal (woodchopper)', 'CORE', 'CORE', 'TRUNK_ROTATION', 'Rotación de tronco mediante polea o banda; diferente del Pallof antirotación.', 'REP_BASED', NULL, 'REPETITIONS', 'true', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('deadBug', 'Dead bug', 'CORE', 'CORE', 'ANTI_EXTENSION', 'Control de pelvis y columna alternando brazos y piernas.', 'REP_BASED', NULL, 'REPETITIONS', 'true', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Older woodchopPallof family was renamed to pallofPress in V13.
-- Keep that code/ID; rotation now has its own woodchopper base.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    created_at, updated_at
)
SELECT seed.code, seed.name, e.id, seed.equipment, seed.grip_type, seed.grip_width,
       seed.bench_angle, seed.body_position, seed.laterality, seed.trajectory,
       seed.support_type, seed.stance_type, seed.attachment_type,
       seed.shoulder_position, seed.foot_placement, seed.knee_position,
       seed.contraction_type, seed.requires_caution, true,
       seed.primary_focus, seed.secondary_focus, seed.practicality,
       seed.focus_description, 'BIOMECHANICAL_INFERENCE', 'MEDIUM',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('crunchCableKneeling', 'Crunch abdominal de rodillas en polea', 'crunch', 'CABLE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'KNEELING', 'BILATERAL', 'DOWNWARD', 'FREE', 'NOT_APPLICABLE', 'ROPE', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', 'false', 'CORE_FLEXION', NULL, 'COMMON', 'Flexión de tronco desde rodillas; evitar tirar con los brazos.'),
    ('crunchMachineSeated', 'Crunch abdominal sentado en máquina', 'crunch', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', 'false', 'CORE_FLEXION', NULL, 'COMMON', 'Flexión de tronco guiada; la resistencia depende del diseño de máquina.'),
    ('crunchPlateSupine', 'Crunch abdominal con disco en suelo', 'crunch', 'WEIGHT_PLATE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', 'false', 'CORE_FLEXION', NULL, 'COMMON', 'Crunch cargado con disco próximo al tórax, sin tirar del cuello.'),
    ('legRaiseHangingKneesPelvicTilt', 'Elevación de rodillas colgado con retroversión pélvica', 'legRaise', 'BODYWEIGHT', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'HANGING', 'BILATERAL', 'UPWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'true', 'CORE_FLEXION', 'UNILATERAL_STABILITY', 'COMMON', 'La participación abdominal aumenta al bascular la pelvis; de otro modo predominan los flexores de cadera.'),
    ('legRaiseCaptainChairKneesPelvicTilt', 'Elevación de rodillas en silla romana con retroversión pélvica', 'legRaise', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'false', 'CORE_FLEXION', NULL, 'COMMON', 'Antebrazos apoyados en la silla; añadir retroversión pélvica para involucrar el abdomen.'),
    ('legRaiseCaptainChairLegsPelvicTilt', 'Elevación de piernas extendidas en silla romana', 'legRaise', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', 'true', 'CORE_FLEXION', NULL, 'TECHNIQUE_DEPENDENT', 'Mayor palanca; distinguir flexión de cadera de flexión pélvica para no atribuirla solo a abdominales.'),
    ('plankBodyweightHigh', 'Plancha frontal con brazos extendidos', 'plank', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'PRONE', 'BILATERAL', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'EXTENDED', 'ISOMETRIC', 'false', 'CORE_ANTI_EXTENSION', NULL, 'COMMON', 'Isometría de anti-extensión sobre manos y puntas de pies.'),
    ('plankBodyweightLongLever', 'Plancha frontal de palanca larga', 'plank', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'PRONE', 'BILATERAL', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'EXTENDED', 'ISOMETRIC', 'true', 'CORE_ANTI_EXTENSION', NULL, 'TECHNIQUE_DEPENDENT', 'Antebrazos adelantados para aumentar la exigencia sin perder posición lumbar.'),
    ('pallofPressBandStanding', 'Press Pallof con banda de pie', 'pallofPress', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'ISOMETRIC', 'false', 'CORE_ANTI_ROTATION', NULL, 'COMMON', 'Resistir el giro del tronco con anclaje lateral y banda estable.'),
    ('pallofPressCableHalfKneeling', 'Press Pallof en polea medio arrodillado', 'pallofPress', 'CABLE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'HALF_KNEELING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'STAGGERED', 'D_HANDLE', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'ISOMETRIC', 'false', 'CORE_ANTI_ROTATION', NULL, 'COMMON', 'Pallof medio arrodillado, manteniendo pelvis estable frente al tirón lateral.'),
    ('reverseCrunchBodyweightFloor', 'Crunch inverso en suelo', 'reverseCrunch', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'false', 'CORE_FLEXION', NULL, 'COMMON', 'Elevar pelvis mediante flexión lumbar controlada; no impulsarse con las piernas.'),
    ('reverseCrunchBenchSupine', 'Crunch inverso sobre banco', 'reverseCrunch', 'BENCH', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'false', 'CORE_FLEXION', NULL, 'COMMON', 'Retroversión pélvica sobre banco estable, evitando balanceo.'),
    ('abWheelRolloutKneeling', 'Rueda abdominal desde rodillas', 'abWheel', 'AB_WHEEL', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'KNEELING', 'BILATERAL', 'HORIZONTAL', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'true', 'CORE_ANTI_EXTENSION', NULL, 'TECHNIQUE_DEPENDENT', 'Anti-extensión con rueda desde las rodillas; acortar el recorrido si se pierde control.'),
    ('abWheelRolloutStanding', 'Rueda abdominal de pie', 'abWheel', 'AB_WHEEL', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', 'true', 'CORE_ANTI_EXTENSION', NULL, 'TECHNIQUE_DEPENDENT', 'Versión avanzada con gran palanca; progresar solo con control lumbopélvico.'),
    ('sidePlankBodyweightForearm', 'Plancha lateral sobre antebrazo', 'sidePlank', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SIDE_LYING', 'UNILATERAL', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'EXTENDED', 'ISOMETRIC', 'false', 'CORE_LATERAL_STABILITY', NULL, 'COMMON', 'Anti-flexión lateral sobre antebrazo y pies, alternando ambos lados.'),
    ('sidePlankBodyweightKneeBent', 'Plancha lateral con rodillas apoyadas', 'sidePlank', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SIDE_LYING', 'UNILATERAL', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'ISOMETRIC', 'false', 'CORE_LATERAL_STABILITY', NULL, 'COMMON', 'Progresión más accesible con apoyo de rodillas, alternando lados.'),
    ('woodchopperCableHighToLow', 'Giro diagonal de arriba abajo en polea', 'woodchopper', 'CABLE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'HIGH_TO_LOW', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', 'false', 'CORE_LATERAL_STABILITY', NULL, 'COMMON', 'Rotación diagonal con control de pelvis, ejecutada en ambos lados.'),
    ('woodchopperCableLowToHigh', 'Giro diagonal de abajo arriba en polea', 'woodchopper', 'CABLE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'LOW_TO_HIGH', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', 'false', 'CORE_LATERAL_STABILITY', NULL, 'COMMON', 'Rotación diagonal ascendente, controlando el movimiento del tronco.'),
    ('woodchopperBandStanding', 'Giro diagonal con banda', 'woodchopper', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', 'false', 'CORE_LATERAL_STABILITY', NULL, 'COMMON', 'Rotación de tronco con banda anclada, sin convertirlo en Pallof estático.'),
    ('deadBugBodyweightAlternating', 'Dead bug alterno en suelo', 'deadBug', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'ALTERNATING', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'false', 'CORE_ANTI_EXTENSION', NULL, 'COMMON', 'Extensión alterna de brazo y pierna sin arqueo lumbar.'),
    ('deadBugBandPulldown', 'Dead bug con banda desde arriba', 'deadBug', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'ALTERNATING', 'NOT_APPLICABLE', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', 'false', 'CORE_ANTI_EXTENSION', NULL, 'COMMON', 'Añade resistencia de banda a brazos manteniendo control lumbopélvico.')
) AS seed (
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, primary_focus, secondary_focus,
    practicality, focus_description
)
JOIN exercises e ON e.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- Exactly one explicitly selected default for each core family.
UPDATE exercise_variants
SET is_default = false, updated_at = CURRENT_TIMESTAMP
WHERE is_default AND exercise_id IN (
    SELECT id FROM exercises
    WHERE code IN ('crunch','legRaise','plank','pallofPress',
                   'reverseCrunch','abWheel','sidePlank','woodchopper','deadBug')
);
UPDATE exercise_variants
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE active AND code IN (
    'crunchBodyweight','legRaiseHanging','plankBodyweightFront','pallofPressCableStanding',
    'reverseCrunchBodyweightFloor','abWheelRolloutKneeling',
    'sidePlankBodyweightForearm','woodchopperCableHighToLow','deadBugBodyweightAlternating'
);

INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at
)
SELECT v.id, m.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE seed.evidence_level WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 10,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Estimación anatómica según flexión, estabilidad o rotación del tronco. Las regiones no visibles en SVG no se extrapolan.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('crunchCableKneeling', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('crunchCableKneeling', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('crunchCableKneeling', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('crunchMachineSeated', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('crunchMachineSeated', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('crunchMachineSeated', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('crunchPlateSupine', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('crunchPlateSupine', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('crunchPlateSupine', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('legRaiseHangingKneesPelvicTilt', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('legRaiseHangingKneesPelvicTilt', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('legRaiseHangingKneesPelvicTilt', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('legRaiseCaptainChairKneesPelvicTilt', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('legRaiseCaptainChairKneesPelvicTilt', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('legRaiseCaptainChairKneesPelvicTilt', 'TRICEPS_LONG_HEAD', 'STABILIZER', 'LOW'),
    ('legRaiseCaptainChairLegsPelvicTilt', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('legRaiseCaptainChairLegsPelvicTilt', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('legRaiseCaptainChairLegsPelvicTilt', 'RECTUS_FEMORIS', 'SECONDARY', 'LOW'),
    ('plankBodyweightHigh', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('plankBodyweightHigh', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY', 'MEDIUM'),
    ('plankBodyweightHigh', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('plankBodyweightHigh', 'GLUTEUS_MAXIMUS', 'STABILIZER', 'MEDIUM'),
    ('plankBodyweightLongLever', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('plankBodyweightLongLever', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY', 'MEDIUM'),
    ('plankBodyweightLongLever', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('plankBodyweightLongLever', 'GLUTEUS_MAXIMUS', 'STABILIZER', 'MEDIUM'),
    ('pallofPressBandStanding', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('pallofPressBandStanding', 'RECTUS_ABDOMINIS', 'SECONDARY', 'MEDIUM'),
    ('pallofPressBandStanding', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('pallofPressBandStanding', 'GLUTEUS_MEDIUS', 'STABILIZER', 'MEDIUM'),
    ('pallofPressCableHalfKneeling', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('pallofPressCableHalfKneeling', 'RECTUS_ABDOMINIS', 'SECONDARY', 'MEDIUM'),
    ('pallofPressCableHalfKneeling', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('pallofPressCableHalfKneeling', 'GLUTEUS_MEDIUS', 'STABILIZER', 'MEDIUM'),
    ('reverseCrunchBodyweightFloor', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('reverseCrunchBodyweightFloor', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('reverseCrunchBodyweightFloor', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('reverseCrunchBenchSupine', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('reverseCrunchBenchSupine', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('reverseCrunchBenchSupine', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('abWheelRolloutKneeling', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('abWheelRolloutKneeling', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY', 'MEDIUM'),
    ('abWheelRolloutKneeling', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('abWheelRolloutKneeling', 'LATISSIMUS_DORSI', 'SECONDARY', 'LOW'),
    ('abWheelRolloutStanding', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('abWheelRolloutStanding', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY', 'MEDIUM'),
    ('abWheelRolloutStanding', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('abWheelRolloutStanding', 'LATISSIMUS_DORSI', 'SECONDARY', 'LOW'),
    ('sidePlankBodyweightForearm', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('sidePlankBodyweightForearm', 'TRANSVERSE_ABDOMINIS_REGION', 'SECONDARY', 'MEDIUM'),
    ('sidePlankBodyweightForearm', 'GLUTEUS_MEDIUS', 'STABILIZER', 'MEDIUM'),
    ('sidePlankBodyweightKneeBent', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('sidePlankBodyweightKneeBent', 'TRANSVERSE_ABDOMINIS_REGION', 'SECONDARY', 'MEDIUM'),
    ('sidePlankBodyweightKneeBent', 'GLUTEUS_MEDIUS', 'STABILIZER', 'MEDIUM'),
    ('woodchopperCableHighToLow', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('woodchopperCableHighToLow', 'RECTUS_ABDOMINIS', 'SECONDARY', 'MEDIUM'),
    ('woodchopperCableHighToLow', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('woodchopperCableLowToHigh', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('woodchopperCableLowToHigh', 'RECTUS_ABDOMINIS', 'SECONDARY', 'MEDIUM'),
    ('woodchopperCableLowToHigh', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('woodchopperBandStanding', 'OBLIQUES_REGION', 'PRIMARY', 'MEDIUM'),
    ('woodchopperBandStanding', 'RECTUS_ABDOMINIS', 'SECONDARY', 'MEDIUM'),
    ('woodchopperBandStanding', 'TRANSVERSE_ABDOMINIS_REGION', 'STABILIZER', 'MEDIUM'),
    ('deadBugBodyweightAlternating', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('deadBugBodyweightAlternating', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY', 'MEDIUM'),
    ('deadBugBodyweightAlternating', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('deadBugBandPulldown', 'RECTUS_ABDOMINIS', 'PRIMARY', 'MEDIUM'),
    ('deadBugBandPulldown', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY', 'MEDIUM'),
    ('deadBugBandPulldown', 'OBLIQUES_REGION', 'SECONDARY', 'MEDIUM'),
    ('deadBugBandPulldown', 'LATISSIMUS_DORSI', 'STABILIZER', 'LOW')
) AS seed (variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants v ON v.code = seed.variant_code
JOIN muscles m ON m.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

DO $$
DECLARE
    n_variants integer;
    n_mappings integer;
    n_core integer;
BEGIN
    SELECT COUNT(*) INTO n_variants
    FROM exercise_variants WHERE code IN ('crunchCableKneeling', 'crunchMachineSeated', 'crunchPlateSupine', 'legRaiseHangingKneesPelvicTilt', 'legRaiseCaptainChairKneesPelvicTilt', 'legRaiseCaptainChairLegsPelvicTilt', 'plankBodyweightHigh', 'plankBodyweightLongLever', 'pallofPressBandStanding', 'pallofPressCableHalfKneeling', 'reverseCrunchBodyweightFloor', 'reverseCrunchBenchSupine', 'abWheelRolloutKneeling', 'abWheelRolloutStanding', 'sidePlankBodyweightForearm', 'sidePlankBodyweightKneeBent', 'woodchopperCableHighToLow', 'woodchopperCableLowToHigh', 'woodchopperBandStanding', 'deadBugBodyweightAlternating', 'deadBugBandPulldown');
    IF n_variants <> 21 THEN
        RAISE EXCEPTION 'V26: expected 21 new core variants, found %', n_variants;
    END IF;
    SELECT COUNT(*) INTO n_mappings
    FROM exercise_muscle_activations a JOIN exercise_variants v ON v.id=a.exercise_variant_id
    WHERE v.code IN ('crunchCableKneeling', 'crunchMachineSeated', 'crunchPlateSupine', 'legRaiseHangingKneesPelvicTilt', 'legRaiseCaptainChairKneesPelvicTilt', 'legRaiseCaptainChairLegsPelvicTilt', 'plankBodyweightHigh', 'plankBodyweightLongLever', 'pallofPressBandStanding', 'pallofPressCableHalfKneeling', 'reverseCrunchBodyweightFloor', 'reverseCrunchBenchSupine', 'abWheelRolloutKneeling', 'abWheelRolloutStanding', 'sidePlankBodyweightForearm', 'sidePlankBodyweightKneeBent', 'woodchopperCableHighToLow', 'woodchopperCableLowToHigh', 'woodchopperBandStanding', 'deadBugBodyweightAlternating', 'deadBugBandPulldown') AND a.mapping_version=10;
    IF n_mappings <> 70 THEN
        RAISE EXCEPTION 'V26: expected 70 muscle mappings, found %', n_mappings;
    END IF;
    SELECT COUNT(*) INTO n_core
    FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
    WHERE e.main_muscle_group='CORE' AND v.active;
    IF n_core <> 25 THEN
        RAISE EXCEPTION 'V26: expected 25 core variants including the four original ones, found %', n_core;
    END IF;
    IF EXISTS (
        SELECT 1 FROM exercise_variants v WHERE v.code IN ('crunchCableKneeling', 'crunchMachineSeated', 'crunchPlateSupine', 'legRaiseHangingKneesPelvicTilt', 'legRaiseCaptainChairKneesPelvicTilt', 'legRaiseCaptainChairLegsPelvicTilt', 'plankBodyweightHigh', 'plankBodyweightLongLever', 'pallofPressBandStanding', 'pallofPressCableHalfKneeling', 'reverseCrunchBodyweightFloor', 'reverseCrunchBenchSupine', 'abWheelRolloutKneeling', 'abWheelRolloutStanding', 'sidePlankBodyweightForearm', 'sidePlankBodyweightKneeBent', 'woodchopperCableHighToLow', 'woodchopperCableLowToHigh', 'woodchopperBandStanding', 'deadBugBodyweightAlternating', 'deadBugBandPulldown')
        AND NOT EXISTS (SELECT 1 FROM exercise_muscle_activations a
                        WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY')
    ) THEN
        RAISE EXCEPTION 'V26: core variant lacks a primary muscle';
    END IF;
    IF EXISTS (
        SELECT 1 FROM exercises e WHERE e.code IN (
            'crunch','legRaise','plank','pallofPress',
            'reverseCrunch','abWheel','sidePlank','woodchopper','deadBug'
        ) AND (SELECT COUNT(*) FROM exercise_variants v
               WHERE v.exercise_id=e.id AND v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V26: missing or ambiguous core default';
    END IF;
    IF EXISTS (
        SELECT 1 FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
        WHERE e.code='pallofPress' AND v.trajectory IN ('ROTATIONAL','HIGH_TO_LOW','LOW_TO_HIGH')
    ) THEN
        RAISE EXCEPTION 'V26: antirotation Pallof mixed with active rotation';
    END IF;
END $$;
