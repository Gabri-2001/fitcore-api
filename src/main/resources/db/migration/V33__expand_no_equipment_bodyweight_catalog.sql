-- V33: bodyweight exercise gaps. No new SVG muscles or historic code renames.
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_pattern_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_pattern_check
 CHECK (movement_pattern IN (
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
        'ISOLATION',
        'FULL_BODY_CONDITIONING'
 ));

INSERT INTO exercises(
    code,name,exercise_category,main_muscle_group,movement_pattern,
    calories_estimation_type,default_unit,description,active,created_at,updated_at
)
SELECT x.code,x.name,x.category,x.group_code,x.pattern,x.estimation,x.unit,
       x.description,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('airSquat', 'Sentadilla libre', 'STRENGTH', 'QUADRICEPS', 'SQUAT', 'REP_BASED', 'REPETITIONS', 'Sentadilla sin carga externa; tronco estable y recorrido adaptado.'),
    ('gluteBridge', 'Puente de glúteos', 'STRENGTH', 'GLUTES', 'HIP_EXTENSION', 'REP_BASED', 'REPETITIONS', 'Extensión de cadera desde el suelo sin banco.'),
    ('wallSit', 'Sentadilla isométrica en pared', 'STRENGTH', 'QUADRICEPS', 'SQUAT', 'DURATION_BASED', 'SECONDS', 'Mantener la posición de sentadilla apoyado en pared por tiempo.'),
    ('hollowHold', 'Hollow hold', 'STRENGTH', 'CORE', 'ANTI_EXTENSION', 'DURATION_BASED', 'SECONDS', 'Isometría anti-extensión del tronco manteniendo posición lumbar controlada.'),
    ('mountainClimber', 'Mountain climbers', 'STRENGTH', 'CORE', 'ANTI_EXTENSION', 'REP_BASED', 'REPETITIONS', 'Alternancia de rodillas hacia el pecho en apoyo de manos.'),
    ('burpee', 'Burpee', 'STRENGTH', 'FULL_BODY', 'FULL_BODY_CONDITIONING', 'REP_BASED', 'REPETITIONS', 'Secuencia de suelo a bipedestación; el salto puede ajustarse por nivel.'),
    ('jumpingJack', 'Jumping jacks', 'STRENGTH', 'FULL_BODY', 'FULL_BODY_CONDITIONING', 'REP_BASED', 'REPETITIONS', 'Saltos con apertura y cierre coordinados de piernas y brazos.')
) x(code,name,category,group_code,pattern,estimation,unit,description)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercise_variants(
    code,name,exercise_id,equipment,grip_type,grip_width,bench_angle,
    body_position,laterality,trajectory,support_type,stance_type,attachment_type,
    shoulder_position,foot_placement,knee_position,contraction_type,requires_caution,
    active,primary_focus,practicality,resistance_source,required_facility,allows_added_weight,
    allows_assistance,focus_evidence_type,focus_evidence_level,created_at,updated_at
)
SELECT seed.code,seed.name,e.id,'BODYWEIGHT','NO_SPECIFIC_GRIP','NOT_APPLICABLE',
       'NOT_APPLICABLE',seed.body_position,'BILATERAL','NOT_APPLICABLE',
       seed.support_type,'NOT_APPLICABLE','NO_ATTACHMENT','ARMS_IN_FRONT',
       'NOT_APPLICABLE','NOT_APPLICABLE',seed.contraction_type,false,true,
       seed.primary_focus,'COMMON','BODYWEIGHT',seed.facility,seed.allows_added_weight,
       false,'BIOMECHANICAL_INFERENCE','MEDIUM',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('airSquatBodyweight', 'Sentadilla libre sin carga', 'airSquat', 'STANDING', 'FREE', 'DYNAMIC', 'NONE', true, 'QUAD_BIAS'),
    ('gluteBridgeBodyweightFloor', 'Puente de glúteos en suelo', 'gluteBridge', 'SUPINE', 'FLOOR_SUPPORTED', 'DYNAMIC', 'NONE', true, 'GLUTE_BIAS'),
    ('wallSitBodyweight', 'Sentadilla isométrica en pared', 'wallSit', 'STANDING', 'FREE', 'ISOMETRIC', 'WALL', false, 'QUAD_BIAS'),
    ('hollowHoldBodyweight', 'Hollow hold en suelo', 'hollowHold', 'SUPINE', 'FLOOR_SUPPORTED', 'ISOMETRIC', 'NONE', false, 'CORE_ANTI_EXTENSION'),
    ('mountainClimberBodyweightAlternating', 'Mountain climbers alternos', 'mountainClimber', 'PRONE', 'FLOOR_SUPPORTED', 'DYNAMIC', 'NONE', false, 'CORE_ANTI_EXTENSION'),
    ('burpeeBodyweightStandard', 'Burpee sin equipamiento', 'burpee', 'STANDING', 'FREE', 'DYNAMIC', 'NONE', false, 'GENERAL_STRENGTH'),
    ('jumpingJackBodyweightStandard', 'Jumping jacks sin equipamiento', 'jumpingJack', 'STANDING', 'FREE', 'DYNAMIC', 'NONE', false, 'GENERAL_STRENGTH'),
    ('pushUpKneesBodyweight', 'Flexiones con rodillas apoyadas', 'pushUp', 'PRONE', 'FLOOR_SUPPORTED', 'DYNAMIC', 'NONE', false, 'CHEST_STERNAL_BIAS')
) seed(code,name,exercise_code,body_position,support_type,contraction_type,
       facility,allows_added_weight,primary_focus)
JOIN exercises e ON e.code=seed.exercise_code
ON CONFLICT (code) DO NOTHING;

UPDATE exercise_variants SET is_default=true,updated_at=CURRENT_TIMESTAMP
WHERE code IN ('airSquatBodyweight', 'gluteBridgeBodyweightFloor', 'wallSitBodyweight', 'hollowHoldBodyweight', 'mountainClimberBodyweightAlternating', 'burpeeBodyweightStandard', 'jumpingJackBodyweightStandard');

INSERT INTO exercise_muscle_activations(
    exercise_variant_id,muscle_id,role,activation_level,notes,
    confidence,source_type,source_refs,mapping_version,evidence_type,
    evidence_level,source_ref,rationale,created_at,updated_at
)
SELECT v.id,m.id,seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL,'MEDIUM','BIOMECHANICAL_INFERENCE',NULL,13,
       'BIOMECHANICAL_INFERENCE','MEDIUM',NULL,
       'Orientación anatómica cualitativa; sin atribuir mediciones EMG específicas.',
       CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM (VALUES
    ('airSquatBodyweight', 'VASTUS_MEDIALIS', 'PRIMARY'),
    ('airSquatBodyweight', 'RECTUS_FEMORIS', 'PRIMARY'),
    ('airSquatBodyweight', 'GLUTEUS_MAXIMUS', 'SECONDARY'),
    ('gluteBridgeBodyweightFloor', 'GLUTEUS_MAXIMUS', 'PRIMARY'),
    ('gluteBridgeBodyweightFloor', 'HAMSTRINGS_REGION', 'SECONDARY'),
    ('wallSitBodyweight', 'RECTUS_FEMORIS', 'PRIMARY'),
    ('wallSitBodyweight', 'VASTUS_MEDIALIS', 'PRIMARY'),
    ('wallSitBodyweight', 'GLUTEUS_MAXIMUS', 'SECONDARY'),
    ('hollowHoldBodyweight', 'RECTUS_ABDOMINIS', 'PRIMARY'),
    ('hollowHoldBodyweight', 'TRANSVERSE_ABDOMINIS_REGION', 'PRIMARY'),
    ('hollowHoldBodyweight', 'OBLIQUES_REGION', 'SECONDARY'),
    ('mountainClimberBodyweightAlternating', 'RECTUS_ABDOMINIS', 'PRIMARY'),
    ('mountainClimberBodyweightAlternating', 'OBLIQUES_REGION', 'SECONDARY'),
    ('mountainClimberBodyweightAlternating', 'GLUTEUS_MAXIMUS', 'STABILIZER'),
    ('burpeeBodyweightStandard', 'RECTUS_FEMORIS', 'PRIMARY'),
    ('burpeeBodyweightStandard', 'GLUTEUS_MAXIMUS', 'PRIMARY'),
    ('burpeeBodyweightStandard', 'PECTORAL_MIDDLE', 'SECONDARY'),
    ('jumpingJackBodyweightStandard', 'GLUTEUS_MEDIUS', 'PRIMARY'),
    ('jumpingJackBodyweightStandard', 'DELTOID_LATERAL', 'SECONDARY'),
    ('jumpingJackBodyweightStandard', 'GASTROCNEMIUS', 'SECONDARY'),
    ('pushUpKneesBodyweight', 'PECTORAL_MIDDLE', 'PRIMARY'),
    ('pushUpKneesBodyweight', 'TRICEPS_BRACHII', 'SECONDARY'),
    ('pushUpKneesBodyweight', 'SERRATUS_ANTERIOR', 'STABILIZER')
) seed(variant_code,muscle_code,role)
JOIN exercise_variants v ON v.code=seed.variant_code
JOIN muscles m ON m.code=seed.muscle_code
ON CONFLICT (exercise_variant_id,muscle_id) DO NOTHING;

DO $$
DECLARE n integer;
BEGIN
 SELECT COUNT(*) INTO n FROM exercise_variants
 WHERE code IN ('airSquatBodyweight','gluteBridgeBodyweightFloor','wallSitBodyweight','hollowHoldBodyweight','mountainClimberBodyweightAlternating','burpeeBodyweightStandard','jumpingJackBodyweightStandard','pushUpKneesBodyweight');
 IF n<>8 THEN RAISE EXCEPTION 'V33 expected eight new variants, found %',n; END IF;
 SELECT COUNT(*) INTO n FROM exercise_muscle_activations a WHERE a.mapping_version=13;
 IF n<>23 THEN
 RAISE EXCEPTION 'V33 expected 23 activation relations, found %',n; END IF;
 SELECT COUNT(*) INTO n FROM exercises
 WHERE code IN ('airSquat','gluteBridge','wallSit','hollowHold','mountainClimber','burpee','jumpingJack');
 IF n<>7 THEN RAISE EXCEPTION 'V33 expected seven new families, found %',n; END IF;
END $$;
