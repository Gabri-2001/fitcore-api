-- FitCore V23: arm exercise catalog expansion.
-- Maintain six existing exercise families and all historical variant IDs.
-- Activation roles are qualitative biomechanical estimates, never EMG percentages.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    created_at, updated_at
)
SELECT src.code, src.name, e.id, src.equipment, src.grip_type, src.grip_width,
       src.bench_angle, src.body_position, src.laterality, src.trajectory,
       src.support_type, src.stance_type, src.attachment_type, src.shoulder_position,
       src.foot_placement, src.knee_position, 'DYNAMIC', src.requires_caution, true,
       src.primary_focus, src.secondary_focus, src.practicality, src.focus_description,
       'BIOMECHANICAL_INFERENCE', 'MEDIUM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('bicepsCurlBarbellStanding', 'Curl de bíceps de pie con barra', 'bicepsCurl', 'BARBELL', 'SUPINATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'BICEPS_BIAS', NULL, 'COMMON', 'Flexión de codo con barra recta, evitando balanceo del torso.'),
    ('bicepsCurlEzBarStanding', 'Curl de bíceps de pie con barra Z', 'bicepsCurl', 'EZ_BAR', 'SEMI_SUPINATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'BICEPS_BIAS', NULL, 'COMMON', 'Flexión de codo con barra Z; el agarre depende de su diseño.'),
    ('bicepsCurlDumbbellInclineSeated', 'Curl inclinado de bíceps con mancuernas', 'bicepsCurl', 'DUMBBELL', 'SUPINATED', 'NOT_APPLICABLE', 'INCLINE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', false, 'BICEPS_BIAS', NULL, 'COMMON', 'Curl sentado con hombro en extensión relativa; el banco ofrece apoyo.'),
    ('bicepsCurlDumbbellPreacherSeated', 'Curl predicador con mancuerna', 'bicepsCurl', 'DUMBBELL', 'SUPINATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', false, 'BICEPS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Curl unilateral con apoyo del brazo en banco predicador; no corresponde a un ángulo de press.'),
    ('bicepsCurlCableStanding', 'Curl de bíceps de pie en polea', 'bicepsCurl', 'CABLE', 'SUPINATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'STRAIGHT_BAR', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'BICEPS_BIAS', NULL, 'COMMON', 'Curl con resistencia por polea; el perfil de carga depende de la geometría.'),
    ('bicepsCurlDumbbellConcentrationSeated', 'Curl de concentración sentado con mancuerna', 'bicepsCurl', 'DUMBBELL', 'SUPINATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'UPWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', false, 'BICEPS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Curl unilateral con brazo apoyado sobre la cara interna del muslo; sin plataforma predicador.'),
    ('hammerCurlCableRopeStanding', 'Curl martillo de pie con cuerda en polea', 'hammerCurl', 'CABLE', 'NEUTRAL', 'NARROW', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'ROPE', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'BRACHIALIS_BRACHIORADIALIS_BIAS', NULL, 'COMMON', 'Curl de agarre neutro en polea con cuerda.'),
    ('hammerCurlDumbbellSeated', 'Curl martillo sentado con mancuernas', 'hammerCurl', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', false, 'BRACHIALIS_BRACHIORADIALIS_BIAS', NULL, 'COMMON', 'Curl de agarre neutro sentado con mancuernas.'),
    ('reverseCurlBarbellStanding', 'Curl inverso de pie con barra', 'reverseCurl', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'BRACHIALIS_BRACHIORADIALIS_BIAS', NULL, 'COMMON', 'Flexión de codo con agarre prono en barra recta.'),
    ('reverseCurlCableStanding', 'Curl inverso de pie en polea', 'reverseCurl', 'CABLE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'STRAIGHT_BAR', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'BRACHIALIS_BRACHIORADIALIS_BIAS', NULL, 'COMMON', 'Curl con agarre prono y resistencia de polea.'),
    ('tricepsPushdownCableStraightBar', 'Extensión de tríceps en polea con barra recta', 'tricepsPushdown', 'CABLE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'STRAIGHT_BAR', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'TRICEPS_BIAS', NULL, 'COMMON', 'Extensión de codo con barra recta en polea.'),
    ('tricepsPushdownCableVBar', 'Extensión de tríceps en polea con barra V', 'tricepsPushdown', 'CABLE', 'SEMI_PRONATED', 'NARROW', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'V_BAR', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'TRICEPS_BIAS', NULL, 'COMMON', 'Extensión con accesorio en V; el agarre depende de la geometría.'),
    ('tricepsPushdownCableSingleArm', 'Extensión unilateral de tríceps en polea', 'tricepsPushdown', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'TRICEPS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Extensión de codo con asa individual; ejecución unilateral.'),
    ('overheadTricepsExtensionDumbbellSeated', 'Extensión de tríceps sobre la cabeza sentado con mancuerna', 'overheadTricepsExtension', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'OVERHEAD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', false, 'TRICEPS_BIAS', NULL, 'COMMON', 'Extensión de codo sobre la cabeza con mancuerna; el apoyo depende del banco.'),
    ('overheadTricepsExtensionEzBarSeated', 'Extensión de tríceps sobre la cabeza sentado con barra Z', 'overheadTricepsExtension', 'EZ_BAR', 'SEMI_PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'OVERHEAD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', false, 'TRICEPS_BIAS', NULL, 'COMMON', 'Extensión de codo sentado con barra Z por encima de la cabeza.'),
    ('overheadTricepsExtensionCableSingleArm', 'Extensión unilateral de tríceps sobre la cabeza en polea', 'overheadTricepsExtension', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'OVERHEAD', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_OVERHEAD', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'TRICEPS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Extensión unilateral sobre la cabeza con asa de polea.'),
    ('lyingTricepsExtensionDumbbellFlat', 'Extensión de tríceps tumbado con mancuernas', 'lyingTricepsExtension', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'FLAT', 'SUPINE', 'BILATERAL', 'OVERHEAD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', true, 'TRICEPS_BIAS', NULL, 'COMMON', 'Extensión de codo tumbado con mancuernas; controlar el recorrido hacia la cabeza.'),
    ('lyingTricepsExtensionEzBarIncline', 'Extensión de tríceps tumbado en banco inclinado con barra Z', 'lyingTricepsExtension', 'EZ_BAR', 'PRONATED', 'NARROW', 'INCLINE', 'SUPINE', 'BILATERAL', 'OVERHEAD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', true, 'TRICEPS_BIAS', NULL, 'COMMON', 'Extensión de codo tumbado en banco inclinado; recorrido condicionado por movilidad y banco.')
) AS src (
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    requires_caution, primary_focus, secondary_focus, practicality, focus_description
)
JOIN exercises e ON e.code = src.exercise_code
ON CONFLICT (code) DO NOTHING;

-- Make the six pre-existing standard variants explicit defaults.
-- Existing plans/sessions continue referencing their unchanged codes/IDs.
UPDATE exercise_variants
SET is_default = false, updated_at = CURRENT_TIMESTAMP
WHERE is_default AND exercise_id IN (
    SELECT id FROM exercises WHERE main_muscle_group IN ('BICEPS','TRICEPS')
);
UPDATE exercise_variants
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE active AND code IN (
    'bicepsCurlDumbbellStandingSupinated',
    'hammerCurlDumbbellStanding',
    'reverseCurlEzBarStanding',
    'tricepsPushdownCableRope',
    'overheadTricepsExtensionCableRope',
    'lyingTricepsExtensionEzBarFlat'
);

INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale,
    created_at, updated_at
)
SELECT v.id, m.id, src.role,
       CASE src.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE WHEN src.evidence_level = 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 7,
       'BIOMECHANICAL_INFERENCE', src.evidence_level, NULL,
       'Clasificación muscular orientativa por acción del codo, agarre, apoyo y posición del hombro; no son mediciones EMG.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('bicepsCurlBarbellStanding', 'BICEPS_BRACHII', 'PRIMARY', 'MEDIUM'),
    ('bicepsCurlBarbellStanding', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlBarbellStanding', 'BRACHIORADIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlBarbellStanding', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('bicepsCurlBarbellStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('bicepsCurlEzBarStanding', 'BICEPS_BRACHII', 'PRIMARY', 'MEDIUM'),
    ('bicepsCurlEzBarStanding', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlEzBarStanding', 'BRACHIORADIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlEzBarStanding', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('bicepsCurlEzBarStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('bicepsCurlDumbbellInclineSeated', 'BICEPS_BRACHII', 'PRIMARY', 'MEDIUM'),
    ('bicepsCurlDumbbellInclineSeated', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlDumbbellInclineSeated', 'BRACHIORADIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlDumbbellInclineSeated', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW'),
    ('bicepsCurlDumbbellPreacherSeated', 'BICEPS_BRACHII', 'PRIMARY', 'MEDIUM'),
    ('bicepsCurlDumbbellPreacherSeated', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlDumbbellPreacherSeated', 'BRACHIORADIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlDumbbellPreacherSeated', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('bicepsCurlCableStanding', 'BICEPS_BRACHII', 'PRIMARY', 'MEDIUM'),
    ('bicepsCurlCableStanding', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlCableStanding', 'BRACHIORADIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlCableStanding', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('bicepsCurlCableStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('bicepsCurlDumbbellConcentrationSeated', 'BICEPS_BRACHII', 'PRIMARY', 'MEDIUM'),
    ('bicepsCurlDumbbellConcentrationSeated', 'BRACHIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlDumbbellConcentrationSeated', 'BRACHIORADIALIS', 'SECONDARY', 'LOW'),
    ('bicepsCurlDumbbellConcentrationSeated', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('hammerCurlCableRopeStanding', 'BRACHIALIS', 'PRIMARY', 'MEDIUM'),
    ('hammerCurlCableRopeStanding', 'BRACHIORADIALIS', 'PRIMARY', 'MEDIUM'),
    ('hammerCurlCableRopeStanding', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('hammerCurlCableRopeStanding', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('hammerCurlDumbbellSeated', 'BRACHIALIS', 'PRIMARY', 'MEDIUM'),
    ('hammerCurlDumbbellSeated', 'BRACHIORADIALIS', 'PRIMARY', 'MEDIUM'),
    ('hammerCurlDumbbellSeated', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('hammerCurlDumbbellSeated', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('reverseCurlBarbellStanding', 'BRACHIORADIALIS', 'PRIMARY', 'MEDIUM'),
    ('reverseCurlBarbellStanding', 'BRACHIALIS', 'PRIMARY', 'MEDIUM'),
    ('reverseCurlBarbellStanding', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('reverseCurlBarbellStanding', 'FOREARM_EXTENSORS', 'STABILIZER', 'LOW'),
    ('reverseCurlCableStanding', 'BRACHIORADIALIS', 'PRIMARY', 'MEDIUM'),
    ('reverseCurlCableStanding', 'BRACHIALIS', 'PRIMARY', 'MEDIUM'),
    ('reverseCurlCableStanding', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('reverseCurlCableStanding', 'FOREARM_EXTENSORS', 'STABILIZER', 'LOW'),
    ('tricepsPushdownCableStraightBar', 'TRICEPS_LATERAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('tricepsPushdownCableStraightBar', 'TRICEPS_MEDIAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('tricepsPushdownCableStraightBar', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('tricepsPushdownCableStraightBar', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW'),
    ('tricepsPushdownCableStraightBar', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('tricepsPushdownCableVBar', 'TRICEPS_LATERAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('tricepsPushdownCableVBar', 'TRICEPS_MEDIAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('tricepsPushdownCableVBar', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('tricepsPushdownCableVBar', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW'),
    ('tricepsPushdownCableVBar', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('tricepsPushdownCableSingleArm', 'TRICEPS_LATERAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('tricepsPushdownCableSingleArm', 'TRICEPS_MEDIAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('tricepsPushdownCableSingleArm', 'TRICEPS_LONG_HEAD', 'SECONDARY', 'LOW'),
    ('tricepsPushdownCableSingleArm', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('overheadTricepsExtensionDumbbellSeated', 'TRICEPS_LONG_HEAD', 'PRIMARY', 'MEDIUM'),
    ('overheadTricepsExtensionDumbbellSeated', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadTricepsExtensionDumbbellSeated', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadTricepsExtensionDumbbellSeated', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW'),
    ('overheadTricepsExtensionEzBarSeated', 'TRICEPS_LONG_HEAD', 'PRIMARY', 'MEDIUM'),
    ('overheadTricepsExtensionEzBarSeated', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadTricepsExtensionEzBarSeated', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadTricepsExtensionEzBarSeated', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW'),
    ('overheadTricepsExtensionCableSingleArm', 'TRICEPS_LONG_HEAD', 'PRIMARY', 'MEDIUM'),
    ('overheadTricepsExtensionCableSingleArm', 'TRICEPS_LATERAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadTricepsExtensionCableSingleArm', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('overheadTricepsExtensionCableSingleArm', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('lyingTricepsExtensionDumbbellFlat', 'TRICEPS_LONG_HEAD', 'PRIMARY', 'MEDIUM'),
    ('lyingTricepsExtensionDumbbellFlat', 'TRICEPS_LATERAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('lyingTricepsExtensionDumbbellFlat', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('lyingTricepsExtensionDumbbellFlat', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW'),
    ('lyingTricepsExtensionEzBarIncline', 'TRICEPS_LONG_HEAD', 'PRIMARY', 'MEDIUM'),
    ('lyingTricepsExtensionEzBarIncline', 'TRICEPS_LATERAL_HEAD', 'PRIMARY', 'MEDIUM'),
    ('lyingTricepsExtensionEzBarIncline', 'TRICEPS_MEDIAL_HEAD', 'SECONDARY', 'LOW'),
    ('lyingTricepsExtensionEzBarIncline', 'DELTOID_ANTERIOR', 'STABILIZER', 'LOW')
) AS src (variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants v ON v.code = src.variant_code
JOIN muscles m ON m.code = src.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

DO $$
DECLARE
    new_variants integer;
    new_mappings integer;
    biceps_count integer;
    triceps_count integer;
BEGIN
    SELECT COUNT(*) INTO new_variants FROM exercise_variants WHERE code IN ('bicepsCurlBarbellStanding', 'bicepsCurlEzBarStanding', 'bicepsCurlDumbbellInclineSeated', 'bicepsCurlDumbbellPreacherSeated', 'bicepsCurlCableStanding', 'bicepsCurlDumbbellConcentrationSeated', 'hammerCurlCableRopeStanding', 'hammerCurlDumbbellSeated', 'reverseCurlBarbellStanding', 'reverseCurlCableStanding', 'tricepsPushdownCableStraightBar', 'tricepsPushdownCableVBar', 'tricepsPushdownCableSingleArm', 'overheadTricepsExtensionDumbbellSeated', 'overheadTricepsExtensionEzBarSeated', 'overheadTricepsExtensionCableSingleArm', 'lyingTricepsExtensionDumbbellFlat', 'lyingTricepsExtensionEzBarIncline');
    IF new_variants <> 18 THEN
        RAISE EXCEPTION 'V23: expected 18 new arm variants, found %', new_variants;
    END IF;
    SELECT COUNT(*) INTO new_mappings
    FROM exercise_muscle_activations a
    JOIN exercise_variants v ON v.id = a.exercise_variant_id
    WHERE v.code IN ('bicepsCurlBarbellStanding', 'bicepsCurlEzBarStanding', 'bicepsCurlDumbbellInclineSeated', 'bicepsCurlDumbbellPreacherSeated', 'bicepsCurlCableStanding', 'bicepsCurlDumbbellConcentrationSeated', 'hammerCurlCableRopeStanding', 'hammerCurlDumbbellSeated', 'reverseCurlBarbellStanding', 'reverseCurlCableStanding', 'tricepsPushdownCableStraightBar', 'tricepsPushdownCableVBar', 'tricepsPushdownCableSingleArm', 'overheadTricepsExtensionDumbbellSeated', 'overheadTricepsExtensionEzBarSeated', 'overheadTricepsExtensionCableSingleArm', 'lyingTricepsExtensionDumbbellFlat', 'lyingTricepsExtensionEzBarIncline') AND a.mapping_version = 7;
    IF new_mappings <> 77 THEN
        RAISE EXCEPTION 'V23: expected 77 activation mappings, found %', new_mappings;
    END IF;

    SELECT COUNT(*) INTO biceps_count FROM exercise_variants v
    JOIN exercises e ON e.id = v.exercise_id WHERE e.main_muscle_group = 'BICEPS' AND v.active;
    SELECT COUNT(*) INTO triceps_count FROM exercise_variants v
    JOIN exercises e ON e.id = v.exercise_id WHERE e.main_muscle_group = 'TRICEPS' AND v.active;
    IF biceps_count <> 13 OR triceps_count <> 11 THEN
        RAISE EXCEPTION 'V23: expected 13 biceps and 11 triceps variants, found % / %',
            biceps_count, triceps_count;
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        WHERE v.code IN ('bicepsCurlBarbellStanding', 'bicepsCurlEzBarStanding', 'bicepsCurlDumbbellInclineSeated', 'bicepsCurlDumbbellPreacherSeated', 'bicepsCurlCableStanding', 'bicepsCurlDumbbellConcentrationSeated', 'hammerCurlCableRopeStanding', 'hammerCurlDumbbellSeated', 'reverseCurlBarbellStanding', 'reverseCurlCableStanding', 'tricepsPushdownCableStraightBar', 'tricepsPushdownCableVBar', 'tricepsPushdownCableSingleArm', 'overheadTricepsExtensionDumbbellSeated', 'overheadTricepsExtensionEzBarSeated', 'overheadTricepsExtensionCableSingleArm', 'lyingTricepsExtensionDumbbellFlat', 'lyingTricepsExtensionEzBarIncline')
        AND NOT EXISTS (SELECT 1 FROM exercise_muscle_activations a
                        WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY')
    ) THEN
        RAISE EXCEPTION 'V23: arm variant without primary muscle';
    END IF;
    IF EXISTS (
        SELECT 1 FROM exercises e WHERE e.main_muscle_group IN ('BICEPS','TRICEPS')
        AND (SELECT COUNT(*) FROM exercise_variants v
             WHERE v.exercise_id = e.id AND v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V23: nonunique/missing default in arm exercises';
    END IF;
END $$;
