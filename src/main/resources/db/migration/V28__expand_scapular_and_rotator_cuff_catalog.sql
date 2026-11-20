-- V28: Escápulas y manguito rotador: patrones específicos y activación cualitativa.
-- No se duplican face pull, remos, flexiones de pecho ni dominadas tradicionales.
-- Los códigos/IDs y los historiales existentes permanecen estables.
-- Fuentes generales: anatomía del manguito (NCBI Bookshelf NBK513324) y
-- revisión de push-up plus (PMID 31584855); las asignaciones son inferencias
-- por variante, NO mediciones EMG directamente atribuibles a estas ejecuciones.

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
        'SHOULDER_INTERNAL_ROTATION',
        'SCAPULAR_PROTRACTION',
        'SCAPULAR_UPWARD_ROTATION',
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

-- Subescapular profundo: no atribuir una región SVG ficticia.
INSERT INTO muscles (
    code, name, muscle_group, description, visual_only_region,
    has_svg_region, active, created_at, updated_at
)
VALUES ('SUBSCAPULARIS','Subescapular','ROTATOR_CUFF',
        'Principal rotador interno del manguito; no visible directamente en el mapa SVG.',
        false,false,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercises (
    code,name,exercise_category,main_muscle_group,movement_pattern,
    description,calories_estimation_type,base_calories_per_unit,default_unit,
    active,created_at,updated_at
)
SELECT seed.code,seed.name,seed.category,seed.group_code,seed.pattern,
       seed.description,seed.calories,NULL,seed.unit,true,
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('scapularPushUp', 'Flexiones escapulares', 'STRENGTH', 'SCAPULAR', 'SCAPULAR_PROTRACTION', 'Protracción escapular manteniendo codos extendidos; no es una flexión convencional.', 'REP_BASED', NULL, 'REPETITIONS', true),
    ('scapularPullUp', 'Dominadas escapulares', 'STRENGTH', 'SCAPULAR', 'SCAPULAR_RETRACTION_DEPRESSION', 'Depresión de las escápulas en suspensión con codos casi extendidos; distinta de dominadas de codo.', 'REP_BASED', NULL, 'REPETITIONS', true),
    ('scapularRetraction', 'Retracción escapular con brazos extendidos', 'STRENGTH', 'SCAPULAR', 'SCAPULAR_RETRACTION_DEPRESSION', 'Aproximar escápulas sin realizar el remo con flexión activa del codo.', 'REP_BASED', NULL, 'REPETITIONS', true),
    ('wallSlide', 'Deslizamientos en pared', 'STRENGTH', 'SCAPULAR', 'SCAPULAR_UPWARD_ROTATION', 'Elevación y control de escápulas con antebrazos deslizándose en pared.', 'REP_BASED', NULL, 'REPETITIONS', true),
    ('proneYRaise', 'Elevación en Y', 'STRENGTH', 'SCAPULAR', 'SCAPULAR_UPWARD_ROTATION', 'Elevación en plano escapular en forma de Y, con tronco apoyado o en suelo.', 'REP_BASED', NULL, 'REPETITIONS', true),
    ('shoulderExternalRotation', 'Rotación externa de hombro', 'STRENGTH', 'ROTATOR_CUFF', 'SHOULDER_EXTERNAL_ROTATION', 'Rotación externa glenohumeral con resistencia; distinta del face pull.', 'REP_BASED', NULL, 'REPETITIONS', true),
    ('shoulderInternalRotation', 'Rotación interna de hombro', 'STRENGTH', 'ROTATOR_CUFF', 'SHOULDER_INTERNAL_ROTATION', 'Rotación interna glenohumeral controlada sin desplazar la escápula.', 'REP_BASED', NULL, 'REPETITIONS', true)
) AS seed (code,name,category,group_code,pattern,description,calories,ignored,unit,active)
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
    ('scapularPushUpFloor', 'Flexiones escapulares en suelo', 'scapularPushUp', 'BODYWEIGHT', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'PRONE', 'BILATERAL', 'HORIZONTAL', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'EXTENDED', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Protracción final con codos extendidos; sin descender el pecho como en flexiones convencionales.'),
    ('scapularPushUpKnees', 'Flexiones escapulares con rodillas apoyadas', 'scapularPushUp', 'BODYWEIGHT', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'PRONE', 'BILATERAL', 'HORIZONTAL', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Protracción escapular desde apoyo de manos y rodillas; progresión de menor palanca.'),
    ('scapularPushUpWall', 'Flexiones escapulares en pared', 'scapularPushUp', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Protracción escapular con manos contra pared, codos extendidos; no es una flexión de pecho.'),
    ('scapularPullUpPronated', 'Dominadas escapulares con agarre prono', 'scapularPullUp', 'BODYWEIGHT', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'HANGING', 'BILATERAL', 'DOWNWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'SCAPULAR_CONTROL', NULL, 'TECHNIQUE_DEPENDENT', 'Depresión de hombros en suspensión sin flexionar activamente los codos.'),
    ('scapularPullUpNeutral', 'Dominadas escapulares con agarre neutro', 'scapularPullUp', 'BODYWEIGHT', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'HANGING', 'BILATERAL', 'DOWNWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'SCAPULAR_CONTROL', NULL, 'TECHNIQUE_DEPENDENT', 'Trabajo de depresión escapular con asas neutras; no realizar dominadas completas.'),
    ('scapularRetractionCableSeated', 'Retracción escapular sentado en polea con codos extendidos', 'scapularRetraction', 'CABLE', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_CHEST', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'V_BAR', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Mover solo las escápulas, con codos prácticamente fijos; no convertirlo en remo sentado.'),
    ('scapularRetractionBandStanding', 'Retracción escapular con banda y brazos extendidos', 'scapularRetraction', 'BAND', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Retracción sin flexión apreciable del codo; resistencia de banda anclada delante.'),
    ('wallSlideBodyweight', 'Deslizamiento de antebrazos en pared', 'wallSlide', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Deslizar antebrazos arriba mientras se coordina rotación escapular, sin forzar el recorrido.'),
    ('wallSlideBandForearms', 'Deslizamiento en pared con banda en antebrazos', 'wallSlide', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'La banda añade resistencia a abducción; priorizar control y rango sin dolor.'),
    ('proneYRaiseDumbbellIncline', 'Elevación en Y con mancuernas en banco inclinado', 'proneYRaise', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'INCLINE', 'INCLINE_PRONE', 'BILATERAL', 'UPWARD', 'CHEST_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Elevación en Y con poco peso sobre banco inclinado, evitando encoger los hombros.'),
    ('proneYRaiseBodyweightFloor', 'Elevación en Y en suelo sin carga', 'proneYRaise', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'PRONE', 'BILATERAL', 'UPWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'SCAPULAR_CONTROL', NULL, 'COMMON', 'Elevación en Y sin carga externa tumbado boca abajo, con control cervical.'),
    ('shoulderExternalRotationCableStanding', 'Rotación externa de hombro de pie en polea', 'shoulderExternalRotation', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'ROTATOR_CUFF_EXTERNAL_ROTATION', NULL, 'COMMON', 'Codo junto al costado, antebrazo gira hacia fuera sin rotar el tronco.'),
    ('shoulderExternalRotationBandStanding', 'Rotación externa de hombro de pie con banda', 'shoulderExternalRotation', 'BAND', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'ROTATOR_CUFF_EXTERNAL_ROTATION', NULL, 'COMMON', 'Rotación externa con banda anclada a altura del codo; limitar compensaciones.'),
    ('shoulderExternalRotationDumbbellSideLying', 'Rotación externa de hombro tumbado de lado con mancuerna', 'shoulderExternalRotation', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SIDE_LYING', 'UNILATERAL', 'ROTATIONAL', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'ROTATOR_CUFF_EXTERNAL_ROTATION', NULL, 'COMMON', 'Rotación externa contra gravedad con codo junto al torso; utilizar carga ligera.'),
    ('shoulderExternalRotationCableAbducted', 'Rotación externa de hombro con brazo separado en polea', 'shoulderExternalRotation', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ABDUCTED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', true, 'ROTATOR_CUFF_EXTERNAL_ROTATION', NULL, 'TECHNIQUE_DEPENDENT', 'Codo elevado y flexionado, rotación externa con recorrido y carga adaptados.'),
    ('shoulderInternalRotationCableStanding', 'Rotación interna de hombro de pie en polea', 'shoulderInternalRotation', 'CABLE', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'D_HANDLE', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'ROTATOR_CUFF_INTERNAL_ROTATION', NULL, 'COMMON', 'Con codo junto al costado, rotar el húmero hacia dentro sin girar el tronco.'),
    ('shoulderInternalRotationBandStanding', 'Rotación interna de hombro de pie con banda', 'shoulderInternalRotation', 'BAND', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'ROTATIONAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false, 'ROTATOR_CUFF_INTERNAL_ROTATION', NULL, 'COMMON', 'Rotación interna suave contra banda elástica, manteniendo postura estable.')
) AS seed (
    code,name,exercise_code,equipment,grip_type,grip_width,bench_angle,
    body_position,laterality,trajectory,support_type,stance_type,
    attachment_type,shoulder_position,foot_placement,knee_position,
    contraction_type,requires_caution,primary_focus,secondary_focus,
    practicality,focus_description
)
JOIN exercises e ON e.code=seed.exercise_code
ON CONFLICT (code) DO NOTHING;

UPDATE exercise_variants SET is_default=false,updated_at=CURRENT_TIMESTAMP
WHERE is_default AND exercise_id IN (SELECT id FROM exercises WHERE code IN ('scapularPushUp', 'scapularPullUp', 'scapularRetraction', 'wallSlide', 'proneYRaise', 'shoulderExternalRotation', 'shoulderInternalRotation'));
UPDATE exercise_variants SET is_default=true,updated_at=CURRENT_TIMESTAMP
WHERE active AND code IN ('scapularPushUpFloor', 'scapularPullUpPronated', 'scapularRetractionCableSeated', 'wallSlideBodyweight', 'proneYRaiseBodyweightFloor', 'shoulderExternalRotationBandStanding', 'shoulderInternalRotationBandStanding');

INSERT INTO exercise_muscle_activations (
    exercise_variant_id,muscle_id,role,activation_level,notes,
    confidence,source_type,source_refs,mapping_version,
    evidence_type,evidence_level,source_ref,rationale,created_at,updated_at
)
SELECT v.id,m.id,seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL,CASE seed.level WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE',NULL,12,
       'BIOMECHANICAL_INFERENCE',seed.level,NULL,
       'Inferencia anatómica orientativa sobre patrón escapular o giro glenohumeral; no cuantifica activación EMG.',
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('scapularPushUpFloor', 'SERRATUS_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('scapularPushUpFloor', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('scapularPushUpKnees', 'SERRATUS_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('scapularPushUpKnees', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('scapularPushUpWall', 'SERRATUS_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('scapularPullUpPronated', 'TRAPEZIUS_LOWER', 'PRIMARY', 'MEDIUM'),
    ('scapularPullUpPronated', 'LATISSIMUS_DORSI', 'SECONDARY', 'LOW'),
    ('scapularPullUpPronated', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('scapularPullUpNeutral', 'TRAPEZIUS_LOWER', 'PRIMARY', 'MEDIUM'),
    ('scapularPullUpNeutral', 'LATISSIMUS_DORSI', 'SECONDARY', 'LOW'),
    ('scapularPullUpNeutral', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'LOW'),
    ('scapularRetractionCableSeated', 'TRAPEZIUS_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('scapularRetractionCableSeated', 'RHOMBOIDS_REGION', 'PRIMARY', 'MEDIUM'),
    ('scapularRetractionCableSeated', 'TRAPEZIUS_LOWER', 'SECONDARY', 'LOW'),
    ('scapularRetractionBandStanding', 'TRAPEZIUS_MIDDLE', 'PRIMARY', 'MEDIUM'),
    ('scapularRetractionBandStanding', 'RHOMBOIDS_REGION', 'PRIMARY', 'MEDIUM'),
    ('scapularRetractionBandStanding', 'TRAPEZIUS_LOWER', 'SECONDARY', 'LOW'),
    ('wallSlideBodyweight', 'SERRATUS_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('wallSlideBodyweight', 'TRAPEZIUS_LOWER', 'SECONDARY', 'LOW'),
    ('wallSlideBodyweight', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('wallSlideBandForearms', 'SERRATUS_ANTERIOR', 'PRIMARY', 'MEDIUM'),
    ('wallSlideBandForearms', 'TRAPEZIUS_LOWER', 'SECONDARY', 'LOW'),
    ('wallSlideBandForearms', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('proneYRaiseDumbbellIncline', 'TRAPEZIUS_LOWER', 'PRIMARY', 'MEDIUM'),
    ('proneYRaiseDumbbellIncline', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('proneYRaiseDumbbellIncline', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('proneYRaiseDumbbellIncline', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('proneYRaiseBodyweightFloor', 'TRAPEZIUS_LOWER', 'PRIMARY', 'MEDIUM'),
    ('proneYRaiseBodyweightFloor', 'SERRATUS_ANTERIOR', 'SECONDARY', 'LOW'),
    ('proneYRaiseBodyweightFloor', 'DELTOID_ANTERIOR', 'SECONDARY', 'LOW'),
    ('proneYRaiseBodyweightFloor', 'INFRASPINATUS', 'STABILIZER', 'LOW'),
    ('shoulderExternalRotationCableStanding', 'INFRASPINATUS', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationCableStanding', 'TERES_MINOR', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationBandStanding', 'INFRASPINATUS', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationBandStanding', 'TERES_MINOR', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationDumbbellSideLying', 'INFRASPINATUS', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationDumbbellSideLying', 'TERES_MINOR', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationCableAbducted', 'INFRASPINATUS', 'PRIMARY', 'MEDIUM'),
    ('shoulderExternalRotationCableAbducted', 'TERES_MINOR', 'PRIMARY', 'MEDIUM'),
    ('shoulderInternalRotationCableStanding', 'SUBSCAPULARIS', 'PRIMARY', 'MEDIUM'),
    ('shoulderInternalRotationCableStanding', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW'),
    ('shoulderInternalRotationBandStanding', 'SUBSCAPULARIS', 'PRIMARY', 'MEDIUM'),
    ('shoulderInternalRotationBandStanding', 'PECTORAL_MIDDLE', 'SECONDARY', 'LOW')
) AS seed (variant_code,muscle_code,role,level)
JOIN exercise_variants v ON v.code=seed.variant_code
JOIN muscles m ON m.code=seed.muscle_code
ON CONFLICT (exercise_variant_id,muscle_id) DO NOTHING;

DO $$
DECLARE
    n_exercises integer; n_variants integer; n_mappings integer;
BEGIN
    SELECT COUNT(*) INTO n_exercises FROM exercises
    WHERE main_muscle_group IN ('SCAPULAR','ROTATOR_CUFF') AND active;
    IF n_exercises <> 7 THEN
        RAISE EXCEPTION 'V28: expected 7 scapular/cuff families, found %',n_exercises;
    END IF;
    SELECT COUNT(*) INTO n_variants FROM exercise_variants v
    JOIN exercises e ON e.id=v.exercise_id
    WHERE e.main_muscle_group IN ('SCAPULAR','ROTATOR_CUFF') AND v.active;
    IF n_variants <> 17 THEN
        RAISE EXCEPTION 'V28: expected 17 scapular/cuff variants, found %',n_variants;
    END IF;
    SELECT COUNT(*) INTO n_mappings FROM exercise_muscle_activations a
    WHERE a.mapping_version=12;
    IF n_mappings <> 43 THEN
        RAISE EXCEPTION 'V28: expected 43 muscle roles, found %',n_mappings;
    END IF;
    IF EXISTS(
        SELECT 1 FROM exercises e WHERE e.code IN ('scapularPushUp', 'scapularPullUp', 'scapularRetraction', 'wallSlide', 'proneYRaise', 'shoulderExternalRotation', 'shoulderInternalRotation')
        AND (SELECT COUNT(*) FROM exercise_variants v WHERE v.exercise_id=e.id
             AND v.is_default AND v.active) <> 1
    ) THEN RAISE EXCEPTION 'V28: ambiguous or missing default variant'; END IF;
    IF EXISTS(
        SELECT 1 FROM exercise_variants v WHERE v.code IN ('scapularPushUpFloor', 'scapularPushUpKnees', 'scapularPushUpWall', 'scapularPullUpPronated', 'scapularPullUpNeutral', 'scapularRetractionCableSeated', 'scapularRetractionBandStanding', 'wallSlideBodyweight', 'wallSlideBandForearms', 'proneYRaiseDumbbellIncline', 'proneYRaiseBodyweightFloor', 'shoulderExternalRotationCableStanding', 'shoulderExternalRotationBandStanding', 'shoulderExternalRotationDumbbellSideLying', 'shoulderExternalRotationCableAbducted', 'shoulderInternalRotationCableStanding', 'shoulderInternalRotationBandStanding')
        AND NOT EXISTS(SELECT 1 FROM exercise_muscle_activations a
                       WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY')
    ) THEN RAISE EXCEPTION 'V28: missing primary muscle'; END IF;
    IF (SELECT has_svg_region FROM muscles WHERE code='SUBSCAPULARIS') IS DISTINCT FROM false
    THEN RAISE EXCEPTION 'V28: subscapularis cannot be drawn directly on SVG'; END IF;
    IF EXISTS(
        SELECT 1 FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
        WHERE e.code='shoulderInternalRotation' AND v.primary_focus <> 'ROTATOR_CUFF_INTERNAL_ROTATION'
    ) THEN RAISE EXCEPTION 'V28: internal/external rotation taxonomy mixed'; END IF;
END $$;
