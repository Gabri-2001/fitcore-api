-- V27: antebrazo, muñeca y fuerza de agarre.
-- Las familias originales permanecen intactas. Carga transportada y suspensión
-- se registran por tiempo (segundos); no se inventan calorías por repetición.
-- Región muscular SVG de antebrazo = aproximación anatómica. Los pronadores y
-- el supinador profundos no tienen regiones SVG directas.

-- Patrones específicos de muñeca/antebrazo; el resto de movimientos se conserva.
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_pattern_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_pattern_check CHECK (
    movement_pattern IN (
        'HORIZONTAL_PUSH',
        'VERTICAL_PUSH',
        'HORIZONTAL_PULL',
        'VERTICAL_PULL',
        'SQUAT',
        'HIP_HINGE',
        'LUNGE',
        'HIP_EXTENSION',
        'HIP_ABDUCTION',
        'HIP_ADDUCTION',
        'KNEE_EXTENSION',
        'KNEE_FLEXION',
        'ELBOW_FLEXION',
        'ELBOW_EXTENSION',
        'SHOULDER_ABDUCTION',
        'SHOULDER_FLEXION',
        'SHOULDER_HORIZONTAL_ABDUCTION',
        'SHOULDER_EXTERNAL_ROTATION',
        'SCAPULAR_ELEVATION',
        'SCAPULAR_RETRACTION_DEPRESSION',
        'ANKLE_PLANTAR_FLEXION',
        'ANKLE_DORSIFLEXION',
        'TRUNK_FLEXION',
        'HIP_TRUNK_FLEXION',
        'TRUNK_ROTATION',
        'ANTI_EXTENSION',
        'ANTI_ROTATION',
        'ANTI_LATERAL_FLEXION',
        'WRIST_FLEXION',
        'WRIST_EXTENSION',
        'FOREARM_ROTATION',
        'WRIST_FLEXION_EXTENSION',
        'GRIP_ISOMETRIC',
        'CARRY',
        'ISOLATION'
    )
);

INSERT INTO muscles (
    code, name, muscle_group, description, visual_only_region,
    has_svg_region, active, created_at, updated_at
)
VALUES
    ('PRONATOR_TERES','Pronador redondo','FOREARMS',
     'Pronación del antebrazo. Músculo sin región SVG directa.',false,false,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
    ('PRONATOR_QUADRATUS','Pronador cuadrado','FOREARMS',
     'Pronador profundo del antebrazo. Sin representación SVG directa.',false,false,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
    ('SUPINATOR','Supinador','FOREARMS',
     'Supinación del antebrazo; músculo profundo sin región SVG directa.',false,false,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercises (
    code,name,exercise_category,main_muscle_group,movement_pattern,
    description,calories_estimation_type,base_calories_per_unit,
    default_unit,active,created_at,updated_at
)
VALUES
    ('wristCurl', 'Flexión de muñeca', 'STRENGTH', 'FOREARMS', 'WRIST_FLEXION', 'Flexión activa de muñeca contra resistencia; distinta de la flexión del codo.', 'REP_BASED', NULL, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('wristExtension', 'Extensión de muñeca', 'STRENGTH', 'FOREARMS', 'WRIST_EXTENSION', 'Extensión activa de muñeca contra resistencia; no es un curl inverso de codo.', 'REP_BASED', NULL, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('forearmRotation', 'Pronación y supinación de antebrazo', 'STRENGTH', 'FOREARMS', 'FOREARM_ROTATION', 'Rotación radiocubital de antebrazo, diferenciando pronación y supinación.', 'REP_BASED', NULL, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('farmerCarry', 'Paseo del granjero', 'STRENGTH', 'FOREARMS', 'CARRY', 'Transporte de carga caminando; el tiempo se registra en segundos, no como repeticiones.', 'DURATION_BASED', NULL, 'SECONDS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('deadHang', 'Suspensión en barra', 'STRENGTH', 'FOREARMS', 'GRIP_ISOMETRIC', 'Suspensión estática de una barra con agarre sostenido; duración en segundos.', 'DURATION_BASED', NULL, 'SECONDS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('staticGripHold', 'Agarre estático con carga', 'STRENGTH', 'FOREARMS', 'GRIP_ISOMETRIC', 'Mantener una carga sin caminar; duración en segundos.', 'DURATION_BASED', NULL, 'SECONDS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('wristRoller', 'Rodillo de muñeca', 'STRENGTH', 'FOREARMS', 'WRIST_FLEXION_EXTENSION', 'Subir y bajar la resistencia enrollando el cordón; una repetición corresponde a un ciclo completo.', 'REP_BASED', NULL, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercise_variants (
    code,name,exercise_id,equipment,grip_type,grip_width,bench_angle,
    body_position,laterality,trajectory,support_type,stance_type,
    attachment_type,shoulder_position,foot_placement,knee_position,
    contraction_type,requires_caution,active,primary_focus,secondary_focus,
    practicality,focus_description,focus_evidence_type,focus_evidence_level,
    created_at,updated_at
)
SELECT seed.code,seed.name,e.id,seed.equipment,seed.grip_type,seed.grip_width,
       seed.bench_angle,seed.body_position,seed.laterality,seed.trajectory,
       seed.support_type,seed.stance_type,seed.attachment_type,
       seed.shoulder_position,seed.foot_placement,seed.knee_position,
       seed.contraction_type,seed.requires_caution::boolean,true,
       seed.primary_focus,seed.secondary_focus,seed.practicality,
       seed.focus_description,'BIOMECHANICAL_INFERENCE','MEDIUM',
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('wristCurlBarbellSeated', 'Flexión de muñeca sentado con barra', 'wristCurl', 'BARBELL', 'SUPINATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_FLEXORS_BIAS', NULL, 'COMMON', 'Antebrazos apoyados, muñecas libres y flexión sin balanceo del codo.'),
    ('wristCurlDumbbellSeatedSingleArm', 'Flexión unilateral de muñeca sentado con mancuerna', 'wristCurl', 'DUMBBELL', 'SUPINATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_FLEXORS_BIAS', NULL, 'COMMON', 'Flexión de muñeca unilateral con antebrazo apoyado, sin flexión activa de codo.'),
    ('wristCurlCableSeated', 'Flexión de muñeca sentado en polea', 'wristCurl', 'CABLE', 'SUPINATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'STRAIGHT_BAR', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_FLEXORS_BIAS', NULL, 'COMMON', 'Flexión de muñeca con polea baja y antebrazos apoyados, sin balanceos.'),
    ('wristExtensionBarbellSeated', 'Extensión de muñeca sentado con barra', 'wristExtension', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_EXTENSORS_BIAS', NULL, 'COMMON', 'Extensión de muñeca con antebrazos apoyados y carga moderada.'),
    ('wristExtensionDumbbellSeatedSingleArm', 'Extensión unilateral de muñeca sentado con mancuerna', 'wristExtension', 'DUMBBELL', 'PRONATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_EXTENSORS_BIAS', NULL, 'COMMON', 'Extensión de muñeca unilateral controlada, evitando compensar con el hombro.'),
    ('wristExtensionCableSeated', 'Extensión de muñeca sentado en polea', 'wristExtension', 'CABLE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'STRAIGHT_BAR', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_EXTENSORS_BIAS', NULL, 'COMMON', 'Extensión de muñeca desde polea con antebrazos apoyados.'),
    ('forearmPronationDumbbellSeated', 'Pronación de antebrazo sentado con mancuerna', 'forearmRotation', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'ROTATIONAL', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'FOREARM_PRONATION', NULL, 'COMMON', 'Antebrazo apoyado; usar la mancuerna como palanca con poco peso para pronar.'),
    ('forearmSupinationDumbbellSeated', 'Supinación de antebrazo sentado con mancuerna', 'forearmRotation', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'ROTATIONAL', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'FOREARM_SUPINATION', NULL, 'COMMON', 'Antebrazo apoyado, rotación controlada hacia supinación sin mover el hombro.'),
    ('forearmPronationBandStanding', 'Pronación de antebrazo de pie con banda', 'forearmRotation', 'BAND', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'FOREARM_PRONATION', NULL, 'COMMON', 'Banda anclada para resistir pronación del antebrazo manteniendo el codo fijo.'),
    ('forearmSupinationBandStanding', 'Supinación de antebrazo de pie con banda', 'forearmRotation', 'BAND', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'FOREARM_SUPINATION', NULL, 'COMMON', 'Banda anclada para resistir supinación, evitando compensaciones del tronco.'),
    ('farmerCarryDumbbellsBilateral', 'Paseo del granjero con mancuernas', 'farmerCarry', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'CARRY', false, 'GRIP_STRENGTH', NULL, 'COMMON', 'Caminar con mancuernas a los lados; registrar segundos y carga utilizada.'),
    ('suitcaseCarryDumbbellSingleArm', 'Paseo de maleta unilateral con mancuerna', 'farmerCarry', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'CARRY', false, 'GRIP_STRENGTH', 'CORE_LATERAL_STABILITY', 'COMMON', 'Transporte unilateral; el agarre trabaja mientras el tronco resiste la inclinación.'),
    ('farmerCarryKettlebellsBilateral', 'Paseo del granjero con pesas rusas', 'farmerCarry', 'KETTLEBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'CARRY', false, 'GRIP_STRENGTH', NULL, 'COMMON', 'Desplazamiento con pesas rusas; mantener muñecas neutras y ritmo estable.'),
    ('farmerCarryTrapBar', 'Paseo del granjero con barra hexagonal', 'farmerCarry', 'TRAP_BAR', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'CARRY', false, 'GRIP_STRENGTH', NULL, 'COMMON', 'Transporte dinámico con barra hexagonal, sin confundirlo con peso muerto.'),
    ('deadHangPronatedBodyweight', 'Suspensión en barra con agarre prono', 'deadHang', 'BODYWEIGHT', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'HANGING', 'BILATERAL', 'NOT_APPLICABLE', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'ISOMETRIC', true, 'GRIP_STRENGTH', NULL, 'COMMON', 'Suspensión pasiva controlada; evitar en caso de dolor de hombro y ajustar la duración.'),
    ('deadHangNeutralBodyweight', 'Suspensión en barra con agarre neutro', 'deadHang', 'BODYWEIGHT', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'HANGING', 'BILATERAL', 'NOT_APPLICABLE', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'ISOMETRIC', true, 'GRIP_STRENGTH', NULL, 'COMMON', 'Suspensión con asas paralelas de agarre neutro; progresar gradualmente.'),
    ('staticGripHoldBarbellStanding', 'Agarre estático de pie con barra', 'staticGripHold', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'NOT_APPLICABLE', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'ISOMETRIC', false, 'GRIP_STRENGTH', NULL, 'COMMON', 'Mantener barra quieta a la altura de los muslos; no es un paseo ni un peso muerto.'),
    ('staticGripHoldDumbbellsStanding', 'Agarre estático de pie con mancuernas', 'staticGripHold', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'NOT_APPLICABLE', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'ISOMETRIC', false, 'GRIP_STRENGTH', NULL, 'COMMON', 'Sostener mancuernas sin desplazarse y registrar segundos bajo carga.'),
    ('wristRollerFlexionStanding', 'Rodillo de muñeca, énfasis en flexores', 'wristRoller', 'WRIST_ROLLER', 'PRONATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_FLEXORS_BIAS', NULL, 'UNCOMMON', 'Enrollar y desenrollar el peso controlando muñecas; un ciclo completo cuenta como una repetición.'),
    ('wristRollerExtensionStanding', 'Rodillo de muñeca, énfasis en extensores', 'wristRoller', 'WRIST_ROLLER', 'PRONATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'WRIST_EXTENSORS_BIAS', NULL, 'UNCOMMON', 'Girar el rodillo en sentido opuesto para enfatizar extensores; contar ciclos completos.')
) AS seed (
    code,name,exercise_code,equipment,grip_type,grip_width,bench_angle,
    body_position,laterality,trajectory,support_type,stance_type,
    attachment_type,shoulder_position,foot_placement,knee_position,
    contraction_type,requires_caution,primary_focus,secondary_focus,
    practicality,focus_description
)
JOIN exercises e ON e.code=seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- Una única variante predeterminada y activa en cada familia V27.
UPDATE exercise_variants SET is_default=false,updated_at=CURRENT_TIMESTAMP
WHERE is_default AND exercise_id IN (SELECT id FROM exercises WHERE code IN ('wristCurl', 'wristExtension', 'forearmRotation', 'farmerCarry', 'deadHang', 'staticGripHold', 'wristRoller'));
UPDATE exercise_variants SET is_default=true,updated_at=CURRENT_TIMESTAMP
WHERE active AND code IN ('wristCurlBarbellSeated', 'wristExtensionBarbellSeated', 'forearmPronationDumbbellSeated', 'farmerCarryDumbbellsBilateral', 'deadHangPronatedBodyweight', 'staticGripHoldDumbbellsStanding', 'wristRollerFlexionStanding');

INSERT INTO exercise_muscle_activations (
    exercise_variant_id,muscle_id,role,activation_level,notes,
    confidence,source_type,source_refs,mapping_version,
    evidence_type,evidence_level,source_ref,rationale,created_at,updated_at
)
SELECT v.id,m.id,seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL,CASE seed.level WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE',NULL,11,
       'BIOMECHANICAL_INFERENCE',seed.level,NULL,
       'Rol anatómico orientativo según flexión/extensión de muñeca, pronosupinación o agarre; no es porcentaje EMG.',
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('wristCurlBarbellSeated', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristCurlDumbbellSeatedSingleArm', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristCurlCableSeated', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristExtensionBarbellSeated', 'FOREARM_EXTENSORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristExtensionDumbbellSeatedSingleArm', 'FOREARM_EXTENSORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristExtensionCableSeated', 'FOREARM_EXTENSORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('forearmPronationDumbbellSeated', 'PRONATOR_TERES', 'PRIMARY', 'MEDIUM'),
    ('forearmPronationDumbbellSeated', 'PRONATOR_QUADRATUS', 'PRIMARY', 'MEDIUM'),
    ('forearmSupinationDumbbellSeated', 'SUPINATOR', 'PRIMARY', 'MEDIUM'),
    ('forearmSupinationDumbbellSeated', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('forearmPronationBandStanding', 'PRONATOR_TERES', 'PRIMARY', 'MEDIUM'),
    ('forearmPronationBandStanding', 'PRONATOR_QUADRATUS', 'PRIMARY', 'MEDIUM'),
    ('forearmSupinationBandStanding', 'SUPINATOR', 'PRIMARY', 'MEDIUM'),
    ('forearmSupinationBandStanding', 'BICEPS_BRACHII', 'SECONDARY', 'LOW'),
    ('farmerCarryDumbbellsBilateral', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('farmerCarryDumbbellsBilateral', 'TRAPEZIUS_UPPER', 'STABILIZER', 'LOW'),
    ('farmerCarryDumbbellsBilateral', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('suitcaseCarryDumbbellSingleArm', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('suitcaseCarryDumbbellSingleArm', 'TRAPEZIUS_UPPER', 'STABILIZER', 'LOW'),
    ('suitcaseCarryDumbbellSingleArm', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('suitcaseCarryDumbbellSingleArm', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('farmerCarryKettlebellsBilateral', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('farmerCarryKettlebellsBilateral', 'TRAPEZIUS_UPPER', 'STABILIZER', 'LOW'),
    ('farmerCarryKettlebellsBilateral', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('farmerCarryTrapBar', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('farmerCarryTrapBar', 'TRAPEZIUS_UPPER', 'STABILIZER', 'LOW'),
    ('farmerCarryTrapBar', 'OBLIQUES_REGION', 'STABILIZER', 'LOW'),
    ('deadHangPronatedBodyweight', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('deadHangPronatedBodyweight', 'LATISSIMUS_DORSI', 'STABILIZER', 'LOW'),
    ('deadHangPronatedBodyweight', 'TRAPEZIUS_LOWER', 'STABILIZER', 'LOW'),
    ('deadHangNeutralBodyweight', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('deadHangNeutralBodyweight', 'LATISSIMUS_DORSI', 'STABILIZER', 'LOW'),
    ('deadHangNeutralBodyweight', 'TRAPEZIUS_LOWER', 'STABILIZER', 'LOW'),
    ('staticGripHoldBarbellStanding', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('staticGripHoldBarbellStanding', 'FOREARM_EXTENSORS_REGION', 'STABILIZER', 'LOW'),
    ('staticGripHoldDumbbellsStanding', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('staticGripHoldDumbbellsStanding', 'FOREARM_EXTENSORS_REGION', 'STABILIZER', 'LOW'),
    ('wristRollerFlexionStanding', 'FOREARM_FLEXORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristRollerFlexionStanding', 'FOREARM_EXTENSORS_REGION', 'SECONDARY', 'LOW'),
    ('wristRollerExtensionStanding', 'FOREARM_EXTENSORS_REGION', 'PRIMARY', 'MEDIUM'),
    ('wristRollerExtensionStanding', 'FOREARM_FLEXORS_REGION', 'SECONDARY', 'LOW')
) AS seed (variant_code,muscle_code,role,level)
JOIN exercise_variants v ON v.code=seed.variant_code
JOIN muscles m ON m.code=seed.muscle_code
ON CONFLICT (exercise_variant_id,muscle_id) DO NOTHING;

DO $$
DECLARE
    n_variants integer; n_mappings integer; n_exercises integer;
BEGIN
    SELECT COUNT(*) INTO n_exercises FROM exercises
    WHERE main_muscle_group='FOREARMS' AND active;
    IF n_exercises <> 7 THEN
        RAISE EXCEPTION 'V27: expected 7 forearm families, found %',n_exercises;
    END IF;

    SELECT COUNT(*) INTO n_variants
    FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
    WHERE e.main_muscle_group='FOREARMS' AND v.active;
    IF n_variants <> 20 THEN
        RAISE EXCEPTION 'V27: expected 20 forearm variants, found %',n_variants;
    END IF;

    SELECT COUNT(*) INTO n_mappings
    FROM exercise_muscle_activations a JOIN exercise_variants v
    ON v.id=a.exercise_variant_id
    WHERE v.code IN ('wristCurlBarbellSeated', 'wristCurlDumbbellSeatedSingleArm', 'wristCurlCableSeated', 'wristExtensionBarbellSeated', 'wristExtensionDumbbellSeatedSingleArm', 'wristExtensionCableSeated', 'forearmPronationDumbbellSeated', 'forearmSupinationDumbbellSeated', 'forearmPronationBandStanding', 'forearmSupinationBandStanding', 'farmerCarryDumbbellsBilateral', 'suitcaseCarryDumbbellSingleArm', 'farmerCarryKettlebellsBilateral', 'farmerCarryTrapBar', 'deadHangPronatedBodyweight', 'deadHangNeutralBodyweight', 'staticGripHoldBarbellStanding', 'staticGripHoldDumbbellsStanding', 'wristRollerFlexionStanding', 'wristRollerExtensionStanding') AND a.mapping_version=11;
    IF n_mappings <> 41 THEN
        RAISE EXCEPTION 'V27: expected 41 muscle relationships, found %',n_mappings;
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v WHERE v.code IN ('wristCurlBarbellSeated', 'wristCurlDumbbellSeatedSingleArm', 'wristCurlCableSeated', 'wristExtensionBarbellSeated', 'wristExtensionDumbbellSeatedSingleArm', 'wristExtensionCableSeated', 'forearmPronationDumbbellSeated', 'forearmSupinationDumbbellSeated', 'forearmPronationBandStanding', 'forearmSupinationBandStanding', 'farmerCarryDumbbellsBilateral', 'suitcaseCarryDumbbellSingleArm', 'farmerCarryKettlebellsBilateral', 'farmerCarryTrapBar', 'deadHangPronatedBodyweight', 'deadHangNeutralBodyweight', 'staticGripHoldBarbellStanding', 'staticGripHoldDumbbellsStanding', 'wristRollerFlexionStanding', 'wristRollerExtensionStanding')
        AND NOT EXISTS (SELECT 1 FROM exercise_muscle_activations a
                        WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY')
    ) THEN
        RAISE EXCEPTION 'V27: new forearm variant lacks primary muscle';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercises e WHERE e.code IN ('wristCurl', 'wristExtension', 'forearmRotation', 'farmerCarry', 'deadHang', 'staticGripHold', 'wristRoller')
        AND (SELECT COUNT(*) FROM exercise_variants v
             WHERE v.exercise_id=e.id AND v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V27: duplicate or missing defaults';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercises e WHERE e.code IN
        ('farmerCarry','deadHang','staticGripHold')
        AND (e.default_unit <> 'SECONDS' OR e.calories_estimation_type <> 'DURATION_BASED')
    ) THEN
        RAISE EXCEPTION 'V27: time-based grip exercise unit mismatch';
    END IF;

    IF EXISTS (
        SELECT 1 FROM muscles m WHERE m.code IN ('PRONATOR_TERES','PRONATOR_QUADRATUS','SUPINATOR')
        AND (m.has_svg_region OR m.muscle_group <> 'FOREARMS')
    ) THEN
        RAISE EXCEPTION 'V27: missing non-SVG anatomy distinction';
    END IF;
END $$;
