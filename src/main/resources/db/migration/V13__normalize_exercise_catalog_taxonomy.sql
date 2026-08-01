-- FitCore catalogue normalization v2.1. This migration is intentionally
-- additive/transformative so databases that already applied V1-V12 retain IDs,
-- workout plans and historical session references.

ALTER TABLE muscles DROP CONSTRAINT IF EXISTS muscles_muscle_group_check;
ALTER TABLE muscles ADD CONSTRAINT muscles_muscle_group_check CHECK (muscle_group IN (
    'CHEST', 'BACK', 'SHOULDERS', 'SCAPULAR', 'ROTATOR_CUFF', 'BICEPS', 'TRICEPS',
    'FOREARMS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'ADDUCTORS', 'CALVES',
    'CORE', 'NECK', 'FULL_BODY'
));

ALTER TABLE muscles
    ADD COLUMN has_svg_region boolean NOT NULL DEFAULT true;

ALTER TABLE exercise_variants
    ADD COLUMN primary_focus varchar(80),
    ADD COLUMN secondary_focus varchar(80),
    ADD COLUMN practicality varchar(40) NOT NULL DEFAULT 'COMMON',
    ADD COLUMN focus_description varchar(1000),
    ADD COLUMN focus_evidence_type varchar(60) NOT NULL DEFAULT 'BIOMECHANICAL_INFERENCE',
    ADD COLUMN focus_evidence_level varchar(30) NOT NULL DEFAULT 'MEDIUM';

ALTER TABLE exercise_muscle_activations
    ADD COLUMN evidence_type varchar(60) NOT NULL DEFAULT 'REVIEW_REQUIRED',
    ADD COLUMN evidence_level varchar(30) NOT NULL DEFAULT 'REVIEW',
    ADD COLUMN source_ref varchar(80),
    ADD COLUMN rationale varchar(1000);

-- Canonical code normalization. IDs are retained so all foreign keys remain valid.
UPDATE muscles SET code = 'DELTOID_ANTERIOR', name = 'Deltoides anterior' WHERE code = 'DELTOID_FRONT';
UPDATE muscles SET code = 'DELTOID_POSTERIOR', name = 'Deltoides posterior' WHERE code = 'DELTOID_REAR';
UPDATE muscles SET code = 'FOREARM_FLEXORS_REGION', name = 'Región flexora del antebrazo',
                   visual_only_region = true WHERE code = 'FOREARM_FLEXORS';
UPDATE muscles SET code = 'FOREARM_EXTENSORS_REGION', name = 'Región extensora del antebrazo',
                   visual_only_region = true WHERE code = 'FOREARM_EXTENSORS';
UPDATE muscles SET code = 'OBLIQUES_REGION', name = 'Región de oblicuos', muscle_group = 'CORE',
                   visual_only_region = true WHERE code = 'OBLIQUES_SERRATUS_REGION';
UPDATE muscles SET code = 'HIP_ADDUCTORS_REGION', name = 'Región de aductores de cadera',
                   muscle_group = 'ADDUCTORS', visual_only_region = true WHERE code = 'HIP_ADDUCTORS';
UPDATE muscles SET code = 'HAMSTRINGS_REGION', name = 'Región de isquiotibiales',
                   visual_only_region = true WHERE code = 'HAMSTRINGS';
UPDATE muscles SET code = 'PERONEALS_REGION', name = 'Región de peroneos',
                   visual_only_region = true WHERE code = 'PERONEALS';
UPDATE muscles SET muscle_group = 'ROTATOR_CUFF' WHERE code = 'INFRASPINATUS';
UPDATE muscles SET visual_only_region = true WHERE code IN (
    'PECTORAL_UPPER', 'PECTORAL_MIDDLE', 'PECTORAL_LOWER', 'RHOMBOIDS_REGION',
    'ERECTOR_SPINAE_LUMBAR'
);

INSERT INTO muscles (code, name, muscle_group, description, visual_only_region,
                     has_svg_region, active, created_at, updated_at)
VALUES
    ('SERRATUS_ANTERIOR', 'Serrato anterior', 'SCAPULAR',
     'Estabilidad, protracción y rotación ascendente escapular.', false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TERES_MINOR', 'Redondo menor', 'ROTATOR_CUFF',
     'Rotación externa y estabilidad glenohumeral.', false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRANSVERSE_ABDOMINIS_REGION', 'Región del transverso abdominal', 'CORE',
     'Región funcional usada para bracing y anti-extensión.', true, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TENSOR_FASCIAE_LATAE', 'Tensor de la fascia lata', 'GLUTES',
     'Flexión y abducción de cadera; sin región SVG directa en v1.', false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VASTUS_INTERMEDIUS', 'Vasto intermedio', 'QUADRICEPS',
     'Extensor profundo de rodilla; sin región SVG directa en v1.', false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Replace visual aggregators with their canonical anatomical portions.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at)
SELECT activation.exercise_variant_id, portion.id, activation.role, activation.activation_level,
       activation.notes, activation.confidence, activation.source_type, activation.source_refs, 3,
       'ANATOMICAL_CONSENSUS',
       CASE activation.confidence WHEN 'HIGH' THEN 'HIGH' WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       COALESCE(activation.source_refs, 'S12'),
       COALESCE(activation.notes, 'El agregador de cuádriceps se descompone en porciones visibles.'),
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM exercise_muscle_activations activation
JOIN muscles aggregate ON aggregate.id = activation.muscle_id AND aggregate.code = 'QUADRICEPS'
CROSS JOIN muscles portion
WHERE portion.code IN ('RECTUS_FEMORIS', 'VASTUS_MEDIALIS', 'VASTUS_LATERALIS')
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at)
SELECT activation.exercise_variant_id, portion.id, activation.role, activation.activation_level,
       activation.notes, activation.confidence, activation.source_type, activation.source_refs, 3,
       'ANATOMICAL_CONSENSUS',
       CASE activation.confidence WHEN 'HIGH' THEN 'HIGH' WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       COALESCE(activation.source_refs, 'S10'),
       COALESCE(activation.notes, 'El agregador de tríceps se descompone en sus cabezas visibles.'),
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM exercise_muscle_activations activation
JOIN muscles aggregate ON aggregate.id = activation.muscle_id AND aggregate.code = 'TRICEPS_BRACHII'
CROSS JOIN muscles portion
WHERE portion.code IN ('TRICEPS_LONG_HEAD', 'TRICEPS_LATERAL_HEAD', 'TRICEPS_MEDIAL_HEAD')
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

DELETE FROM exercise_muscle_activations
WHERE muscle_id IN (SELECT id FROM muscles WHERE code IN ('QUADRICEPS', 'TRICEPS_BRACHII', 'CALVES'));
DELETE FROM muscles WHERE code IN ('QUADRICEPS', 'TRICEPS_BRACHII', 'CALVES');

-- Map legacy evidence metadata into the v2.1 vocabulary without overstating it.
UPDATE exercise_muscle_activations
SET evidence_type = CASE source_type
        WHEN 'PEER_REVIEWED' THEN 'DIRECT_EMG'
        WHEN 'ANATOMICAL_REFERENCE' THEN 'ANATOMICAL_CONSENSUS'
        WHEN 'PROFESSIONAL_REFERENCE' THEN 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE'
        WHEN 'BIOMECHANICAL_INFERENCE' THEN 'BIOMECHANICAL_INFERENCE'
        WHEN 'MIXED' THEN 'BIOMECHANICAL_INFERENCE'
        ELSE 'REVIEW_REQUIRED'
    END,
    evidence_level = CASE confidence
        WHEN 'HIGH' THEN 'HIGH'
        WHEN 'MEDIUM' THEN 'MEDIUM'
        ELSE 'REVIEW'
    END,
    source_ref = LEFT(source_refs, 80),
    rationale = COALESCE(notes, 'Clasificación normalizada desde el catálogo v1; revisar al incorporar evidencia más específica.'),
    mapping_version = 3,
    updated_at = CURRENT_TIMESTAMP;

ALTER TABLE exercise_muscle_activations
    ADD CONSTRAINT exercise_activation_evidence_type_check CHECK (evidence_type IN (
        'DIRECT_EMG', 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE', 'BIOMECHANICAL_INFERENCE',
        'ANATOMICAL_CONSENSUS', 'VISUAL_APPROXIMATION', 'REVIEW_REQUIRED'
    )),
    ADD CONSTRAINT exercise_activation_evidence_level_check CHECK (evidence_level IN (
        'HIGH', 'MEDIUM', 'LOW', 'REVIEW'
    ));

ALTER TABLE exercise_variants
    ADD CONSTRAINT exercise_variant_practicality_check CHECK (practicality IN (
        'COMMON', 'UNCOMMON', 'MACHINE_DEPENDENT', 'TECHNIQUE_DEPENDENT',
        'NOT_RECOMMENDED', 'NOT_APPLICABLE'
    )),
    ADD CONSTRAINT exercise_variant_focus_evidence_type_check CHECK (focus_evidence_type IN (
        'DIRECT_EMG', 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE', 'BIOMECHANICAL_INFERENCE',
        'ANATOMICAL_CONSENSUS', 'VISUAL_APPROXIMATION', 'REVIEW_REQUIRED'
    )),
    ADD CONSTRAINT exercise_variant_focus_evidence_level_check CHECK (focus_evidence_level IN (
        'HIGH', 'MEDIUM', 'LOW', 'REVIEW'
    ));

-- Normalize base codes only where the existing entity already represents the
-- same movement. This avoids duplicate Exercise rows.
UPDATE exercises SET code = 'pullUp', name = 'Dominadas' WHERE code = 'pullUpChinUp';
UPDATE exercises SET code = 'machineChestPress', name = 'Press de pecho en máquina' WHERE code = 'chestPressMachine';
UPDATE exercises SET code = 'seatedCableRow', name = 'Remo sentado en polea' WHERE code = 'seatedRow';
UPDATE exercises SET code = 'pallofPress', name = 'Press Pallof' WHERE code = 'woodchopPallof';

UPDATE exercise_variants SET code = 'pullUpBodyweightPronatedWideGrip',
    name = 'Dominadas pronas con agarre ancho' WHERE code = 'pullUpPronatedWideGrip';
UPDATE exercise_variants SET code = 'pullUpBodyweightSupinatedNarrowGrip',
    name = 'Dominadas supinas con agarre estrecho' WHERE code = 'chinUpSupinatedNarrowGrip';
UPDATE exercise_variants SET code = 'pullUpBodyweightNeutralMediumGrip',
    name = 'Dominadas con agarre neutro medio' WHERE code = 'pullUpNeutralMediumGrip';

-- Complete the 3 x 3 grip/width matrices for pull-ups and lat pulldowns.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle, body_position,
    laterality, trajectory, support_type, stance_type, attachment_type, shoulder_position,
    foot_placement, knee_position, contraction_type, requires_caution, active,
    practicality, created_at, updated_at)
SELECT seed.code, seed.name, exercise.id, seed.equipment, seed.grip_type, seed.grip_width,
       'NOT_APPLICABLE', 'HANGING', 'BILATERAL', 'TO_CHEST', 'FREE', 'NOT_APPLICABLE',
       seed.attachment_type, 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'EXTENDED', 'DYNAMIC',
       seed.requires_caution, true, seed.practicality, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('pullUpBodyweightPronatedNarrowGrip', 'Dominadas pronas con agarre estrecho', 'BODYWEIGHT', 'PRONATED', 'NARROW', 'NO_ATTACHMENT', false, 'COMMON'),
    ('pullUpBodyweightPronatedMediumGrip', 'Dominadas pronas con agarre medio', 'BODYWEIGHT', 'PRONATED', 'MEDIUM', 'NO_ATTACHMENT', false, 'COMMON'),
    ('pullUpBodyweightSupinatedMediumGrip', 'Dominadas supinas con agarre medio', 'BODYWEIGHT', 'SUPINATED', 'MEDIUM', 'NO_ATTACHMENT', false, 'COMMON'),
    ('pullUpBodyweightSupinatedWideGrip', 'Dominadas supinas con agarre ancho', 'BODYWEIGHT', 'SUPINATED', 'WIDE', 'NO_ATTACHMENT', true, 'UNCOMMON'),
    ('pullUpBodyweightNeutralNarrowGrip', 'Dominadas con agarre neutro estrecho', 'BODYWEIGHT', 'NEUTRAL', 'NARROW', 'V_BAR', false, 'MACHINE_DEPENDENT'),
    ('pullUpBodyweightNeutralWideGrip', 'Dominadas con agarre neutro ancho', 'BODYWEIGHT', 'NEUTRAL', 'WIDE', 'MAG_GRIP', true, 'MACHINE_DEPENDENT')
) AS seed(code, name, equipment, grip_type, grip_width, attachment_type, requires_caution, practicality)
JOIN exercises exercise ON exercise.code = 'pullUp'
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle, body_position,
    laterality, trajectory, support_type, stance_type, attachment_type, shoulder_position,
    foot_placement, knee_position, contraction_type, requires_caution, active,
    practicality, created_at, updated_at)
SELECT seed.code, seed.name, exercise.id, 'CABLE', seed.grip_type, seed.grip_width,
       'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_CHEST', 'MACHINE_SUPPORTED',
       'NOT_APPLICABLE', seed.attachment_type, 'ARMS_OVERHEAD', 'NOT_APPLICABLE',
       'NOT_APPLICABLE', 'DYNAMIC', seed.requires_caution, true, seed.practicality,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('latPulldownPronatedNarrowGripToChest', 'Jalón al pecho prono con agarre estrecho', 'PRONATED', 'NARROW', 'STRAIGHT_BAR', false, 'COMMON'),
    ('latPulldownPronatedMediumGripToChest', 'Jalón al pecho prono con agarre medio', 'PRONATED', 'MEDIUM', 'LAT_BAR', false, 'COMMON'),
    ('latPulldownSupinatedMediumGripToChest', 'Jalón al pecho supino con agarre medio', 'SUPINATED', 'MEDIUM', 'STRAIGHT_BAR', false, 'COMMON'),
    ('latPulldownSupinatedWideGripToChest', 'Jalón al pecho supino con agarre ancho', 'SUPINATED', 'WIDE', 'LAT_BAR', true, 'UNCOMMON'),
    ('latPulldownNeutralNarrowGripToChest', 'Jalón al pecho neutro con agarre estrecho', 'NEUTRAL', 'NARROW', 'V_BAR', false, 'MACHINE_DEPENDENT'),
    ('latPulldownNeutralWideGripToChest', 'Jalón al pecho neutro con agarre ancho', 'NEUTRAL', 'WIDE', 'MAG_GRIP', false, 'MACHINE_DEPENDENT')
) AS seed(code, name, grip_type, grip_width, attachment_type, requires_caution, practicality)
JOIN exercises exercise ON exercise.code = 'latPulldown'
ON CONFLICT (code) DO NOTHING;

-- Seed new matrix activations from the closest existing execution, then refine
-- evidence/roles below. This keeps all canonical muscles and rationale intact.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at)
SELECT target.id, activation.muscle_id, activation.role, activation.activation_level,
       activation.notes, activation.confidence, activation.source_type, activation.source_refs, 3,
       activation.evidence_type, activation.evidence_level, activation.source_ref,
       activation.rationale, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('pullUpBodyweightPronatedNarrowGrip', 'pullUpBodyweightPronatedWideGrip'),
    ('pullUpBodyweightPronatedMediumGrip', 'pullUpBodyweightPronatedWideGrip'),
    ('pullUpBodyweightSupinatedMediumGrip', 'pullUpBodyweightSupinatedNarrowGrip'),
    ('pullUpBodyweightSupinatedWideGrip', 'pullUpBodyweightSupinatedNarrowGrip'),
    ('pullUpBodyweightNeutralNarrowGrip', 'pullUpBodyweightNeutralMediumGrip'),
    ('pullUpBodyweightNeutralWideGrip', 'pullUpBodyweightNeutralMediumGrip'),
    ('latPulldownPronatedNarrowGripToChest', 'latPulldownPronatedWideGripToChest'),
    ('latPulldownPronatedMediumGripToChest', 'latPulldownPronatedWideGripToChest'),
    ('latPulldownSupinatedMediumGripToChest', 'latPulldownSupinatedNarrowGripToChest'),
    ('latPulldownSupinatedWideGripToChest', 'latPulldownSupinatedNarrowGripToChest'),
    ('latPulldownNeutralNarrowGripToChest', 'latPulldownNeutralMediumGripToChest'),
    ('latPulldownNeutralWideGripToChest', 'latPulldownNeutralMediumGripToChest')
) AS copies(target_code, source_code)
JOIN exercise_variants target ON target.code = copies.target_code
JOIN exercise_variants source ON source.code = copies.source_code
JOIN exercise_muscle_activations activation ON activation.exercise_variant_id = source.id
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

-- Stabilizers and evidence for the full pull-up matrix.
UPDATE exercise_muscle_activations activation
SET role = CASE muscle.code
        WHEN 'LATISSIMUS_DORSI' THEN 'PRIMARY'
        WHEN 'TRAPEZIUS_MIDDLE' THEN 'STABILIZER'
        WHEN 'TRAPEZIUS_LOWER' THEN 'STABILIZER'
        WHEN 'RHOMBOIDS_REGION' THEN 'STABILIZER'
        WHEN 'FOREARM_FLEXORS_REGION' THEN 'STABILIZER'
        WHEN 'INFRASPINATUS' THEN 'STABILIZER'
        WHEN 'ERECTOR_SPINAE_LUMBAR' THEN 'STABILIZER'
        ELSE 'SECONDARY'
    END,
    activation_level = CASE muscle.code WHEN 'LATISSIMUS_DORSI' THEN 3
        WHEN 'TRAPEZIUS_MIDDLE' THEN 1 WHEN 'TRAPEZIUS_LOWER' THEN 1
        WHEN 'RHOMBOIDS_REGION' THEN 1 WHEN 'FOREARM_FLEXORS_REGION' THEN 1
        WHEN 'INFRASPINATUS' THEN 1 WHEN 'ERECTOR_SPINAE_LUMBAR' THEN 1 ELSE 2 END,
    evidence_type = CASE
        WHEN muscle.code = 'LATISSIMUS_DORSI' THEN 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE'
        WHEN muscle.code IN ('BICEPS_BRACHII', 'BRACHIALIS', 'BRACHIORADIALIS', 'FOREARM_FLEXORS_REGION')
            THEN 'ANATOMICAL_CONSENSUS'
        ELSE 'BIOMECHANICAL_INFERENCE' END,
    evidence_level = CASE WHEN muscle.code = 'ERECTOR_SPINAE_LUMBAR' THEN 'LOW' ELSE 'MEDIUM' END,
    source_ref = CASE
        WHEN muscle.code = 'LATISSIMUS_DORSI' THEN 'S4'
        WHEN muscle.code IN ('BICEPS_BRACHII', 'BRACHIALIS', 'BRACHIORADIALIS', 'FOREARM_FLEXORS_REGION') THEN 'S10'
        ELSE 'S13' END,
    rationale = CASE
        WHEN muscle.code = 'LATISSIMUS_DORSI' THEN 'Tracción vertical; evidencia directa en jalón y transferencia indirecta a dominada.'
        WHEN muscle.code = 'TERES_MAJOR' THEN 'Sinergista de extensión y aducción del hombro; no se trata como protagonista por defecto.'
        WHEN muscle.code = 'RHOMBOIDS_REGION' THEN 'Control escapular; la región SVG es una aproximación visual.'
        ELSE COALESCE(activation.rationale, 'Participación coherente con la función anatómica y la mecánica de la tracción.') END,
    mapping_version = 3,
    updated_at = CURRENT_TIMESTAMP
FROM exercise_variants variant, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id
  AND variant.code LIKE 'pullUpBodyweight%';

UPDATE exercise_muscle_activations activation
SET role = CASE muscle.code
        WHEN 'LATISSIMUS_DORSI' THEN 'PRIMARY'
        WHEN 'TRAPEZIUS_LOWER' THEN 'STABILIZER'
        WHEN 'FOREARM_FLEXORS_REGION' THEN 'STABILIZER'
        WHEN 'INFRASPINATUS' THEN 'STABILIZER'
        ELSE 'SECONDARY' END,
    activation_level = CASE muscle.code WHEN 'LATISSIMUS_DORSI' THEN 3
        WHEN 'TRAPEZIUS_LOWER' THEN 1 WHEN 'FOREARM_FLEXORS_REGION' THEN 1
        WHEN 'INFRASPINATUS' THEN 1 ELSE 2 END,
    evidence_type = CASE
        WHEN muscle.code = 'LATISSIMUS_DORSI' THEN 'DIRECT_EMG'
        WHEN muscle.code IN ('BICEPS_BRACHII', 'BRACHIALIS', 'BRACHIORADIALIS', 'FOREARM_FLEXORS_REGION')
            THEN 'ANATOMICAL_CONSENSUS'
        ELSE 'BIOMECHANICAL_INFERENCE' END,
    evidence_level = 'MEDIUM',
    source_ref = CASE WHEN muscle.code = 'LATISSIMUS_DORSI' THEN 'S4'
        WHEN muscle.code IN ('BICEPS_BRACHII', 'BRACHIALIS', 'BRACHIORADIALIS', 'FOREARM_FLEXORS_REGION') THEN 'S10'
        ELSE 'S13' END,
    mapping_version = 3,
    updated_at = CURRENT_TIMESTAMP
FROM exercise_variants variant, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id
  AND variant.exercise_id = (SELECT id FROM exercises WHERE code = 'latPulldown');

-- Required stabilizers that were missing in the v1 row/press mappings.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at)
SELECT variant.id, muscle.id, seed.role, CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       seed.rationale, 'MEDIUM', 'BIOMECHANICAL_INFERENCE', seed.source_ref, 3,
       seed.evidence_type, 'MEDIUM', seed.source_ref, seed.rationale,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('benchPressBarbellFlatNarrowGrip', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'ANATOMICAL_CONSENSUS', 'S10', 'Estabilización de barra y muñeca.'),
    ('benchPressBarbellFlatNarrowGrip', 'TRAPEZIUS_MIDDLE', 'STABILIZER', 'BIOMECHANICAL_INFERENCE', 'S13', 'Estabilización escapular sobre el banco.'),
    ('benchPressBarbellFlatNarrowGrip', 'RHOMBOIDS_REGION', 'STABILIZER', 'VISUAL_APPROXIMATION', 'S13', 'Retracción escapular; el SVG usa una región aproximada.'),
    ('seatedCableRowNeutralGrip', 'TERES_MAJOR', 'SECONDARY', 'BIOMECHANICAL_INFERENCE', 'S11', 'Sinergista del dorsal en la trayectoria hacia abdomen.'),
    ('seatedCableRowNeutralGrip', 'FOREARM_FLEXORS_REGION', 'STABILIZER', 'ANATOMICAL_CONSENSUS', 'S10', 'Mantiene el agarre durante el remo.'),
    ('overheadPressBarbellStanding', 'SERRATUS_ANTERIOR', 'STABILIZER', 'ANATOMICAL_CONSENSUS', 'S10', 'Contribuye a la estabilidad y rotación escapular.'),
    ('pushUpStandard', 'SERRATUS_ANTERIOR', 'STABILIZER', 'ANATOMICAL_CONSENSUS', 'S10', 'Estabilización y protracción escapular.'),
    ('pushUpNarrowGrip', 'SERRATUS_ANTERIOR', 'STABILIZER', 'ANATOMICAL_CONSENSUS', 'S10', 'Estabilización y protracción escapular.'),
    ('pushUpWideGrip', 'SERRATUS_ANTERIOR', 'STABILIZER', 'ANATOMICAL_CONSENSUS', 'S10', 'Estabilización y protracción escapular.')
) AS seed(variant_code, muscle_code, role, evidence_type, source_ref, rationale)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO UPDATE SET
    role = EXCLUDED.role, activation_level = EXCLUDED.activation_level,
    evidence_type = EXCLUDED.evidence_type, evidence_level = EXCLUDED.evidence_level,
    source_ref = EXCLUDED.source_ref, rationale = EXCLUDED.rationale,
    mapping_version = 3, updated_at = CURRENT_TIMESTAMP;

-- Critical visual corrections from the reviewed document.
UPDATE exercise_muscle_activations activation
SET role = seed.role,
    activation_level = CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
    evidence_type = seed.evidence_type,
    evidence_level = seed.evidence_level,
    source_ref = seed.source_ref,
    rationale = seed.rationale,
    mapping_version = 3,
    updated_at = CURRENT_TIMESTAMP
FROM (VALUES
    ('PECTORAL_MIDDLE', 'PRIMARY', 'DIRECT_EMG', 'MEDIUM', 'S5/S6', 'Press plano: énfasis principal en la porción esternal/media.'),
    ('TRICEPS_LATERAL_HEAD', 'PRIMARY', 'DIRECT_EMG', 'MEDIUM', 'S5', 'Agarre estrecho con sesgo fuerte de extensión de codo.'),
    ('TRICEPS_MEDIAL_HEAD', 'PRIMARY', 'BIOMECHANICAL_INFERENCE', 'MEDIUM', NULL, 'Extensión de codo en press cerrado.'),
    ('TRICEPS_LONG_HEAD', 'SECONDARY', 'BIOMECHANICAL_INFERENCE', 'MEDIUM', NULL, 'Participa sin tratarse como cabeza dominante por defecto.'),
    ('DELTOID_ANTERIOR', 'SECONDARY', 'DIRECT_EMG', 'MEDIUM', 'S6/S7', 'Deltoide anterior secundario en banco plano.'),
    ('PECTORAL_UPPER', 'SECONDARY', 'DIRECT_EMG', 'MEDIUM', 'S6/S7', 'Participa, pero no es protagonista en banco plano.'),
    ('PECTORAL_LOWER', 'SECONDARY', 'BIOMECHANICAL_INFERENCE', 'LOW', NULL, 'Contribución menor en press plano.')
) AS seed(muscle_code, role, evidence_type, evidence_level, source_ref, rationale)
JOIN exercise_variants variant ON variant.code = 'benchPressBarbellFlatNarrowGrip'
JOIN muscles muscle ON muscle.code = seed.muscle_code
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id;

UPDATE exercise_muscle_activations activation
SET role = 'STABILIZER', activation_level = 1,
    evidence_type = 'ANATOMICAL_CONSENSUS', evidence_level = 'MEDIUM', source_ref = 'S10',
    rationale = 'Estabilidad glenohumeral durante la abducción.', mapping_version = 3,
    updated_at = CURRENT_TIMESTAMP
FROM exercise_variants variant, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id
  AND variant.code = 'lateralRaiseDumbbellStanding'
  AND muscle.code = 'INFRASPINATUS';

DELETE FROM exercise_muscle_activations activation
USING exercise_variants variant, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id
  AND variant.code = 'lateralRaiseDumbbellStanding'
  AND muscle.code = 'TRAPEZIUS_MIDDLE';

-- Focus metadata for all real variants. Specific mechanical differences are
-- represented as practical bias, not as claims of muscular isolation.
UPDATE exercise_variants variant
SET primary_focus = CASE
        WHEN exercise.code IN ('pullUp', 'latPulldown', 'straightArmPulldown') THEN 'LAT_BIAS'
        WHEN exercise.code IN ('seatedCableRow', 'machineRow', 'barbellRow', 'oneArmDumbbellRow') THEN 'BACK_THICKNESS'
        WHEN exercise.code IN ('benchPress', 'machineChestPress', 'chestFly', 'pushUp', 'dip') THEN 'CHEST_STERNAL_BIAS'
        WHEN exercise.code = 'overheadPress' THEN 'SHOULDER_STRENGTH'
        WHEN exercise.code = 'lateralRaise' THEN 'SIDE_DELTS_BIAS'
        WHEN exercise.code IN ('rearDeltFly', 'facePull') THEN 'REAR_DELTS_BIAS'
        WHEN exercise.code = 'frontRaise' THEN 'SHOULDER_STRENGTH'
        WHEN exercise.code = 'shrug' THEN 'UPPER_BACK_BIAS'
        WHEN exercise.code = 'bicepsCurl' THEN 'BICEPS_BIAS'
        WHEN exercise.code IN ('hammerCurl', 'reverseCurl') THEN 'BRACHIALIS_BRACHIORADIALIS_BIAS'
        WHEN exercise.code IN ('tricepsPushdown', 'overheadTricepsExtension', 'lyingTricepsExtension') THEN 'TRICEPS_BIAS'
        WHEN exercise.code IN ('backSquat', 'frontSquat', 'hackSquat', 'legPress', 'lunge', 'splitSquat', 'legExtension') THEN 'QUAD_BIAS'
        WHEN exercise.code IN ('deadlift', 'romanianDeadlift', 'goodMorning') THEN 'POSTERIOR_CHAIN'
        WHEN exercise.code IN ('hipThrust', 'gluteKickback') THEN 'GLUTE_BIAS'
        WHEN exercise.code = 'hipAbduction' THEN 'HIP_ABDUCTION_BIAS'
        WHEN exercise.code = 'hipAdduction' THEN 'ADDUCTOR_BIAS'
        WHEN exercise.code = 'legCurl' THEN 'HAMSTRING_BIAS'
        WHEN exercise.code = 'standingCalfRaise' THEN 'CALF_GASTROCNEMIUS_BIAS'
        WHEN exercise.code = 'seatedCalfRaise' THEN 'CALF_SOLEUS_BIAS'
        WHEN exercise.code IN ('crunch', 'legRaise') THEN 'CORE_FLEXION'
        WHEN exercise.code = 'plank' THEN 'CORE_ANTI_EXTENSION'
        WHEN exercise.code = 'pallofPress' THEN 'CORE_ANTI_ROTATION'
        ELSE 'GENERAL_STRENGTH'
    END,
    secondary_focus = CASE
        WHEN exercise.code IN ('pullUp', 'latPulldown') THEN 'BACK_WIDTH'
        WHEN exercise.code IN ('seatedCableRow', 'machineRow', 'barbellRow', 'oneArmDumbbellRow') THEN 'LAT_BIAS'
        WHEN exercise.code IN ('benchPress', 'machineChestPress', 'pushUp', 'dip') THEN 'TRICEPS_BIAS'
        WHEN exercise.code IN ('backSquat', 'frontSquat', 'hackSquat', 'legPress', 'lunge', 'splitSquat') THEN 'GLUTE_BIAS'
        WHEN exercise.code IN ('deadlift', 'romanianDeadlift', 'goodMorning') THEN 'HAMSTRING_BIAS'
        WHEN exercise.code = 'hipThrust' THEN 'HAMSTRING_BIAS'
        ELSE NULL
    END,
    practicality = CASE
        WHEN variant.code IN ('pullUpBodyweightSupinatedWideGrip', 'latPulldownSupinatedWideGripToChest') THEN 'UNCOMMON'
        WHEN variant.code IN ('pullUpBodyweightNeutralNarrowGrip', 'pullUpBodyweightNeutralWideGrip',
                              'latPulldownNeutralNarrowGripToChest', 'latPulldownNeutralWideGripToChest') THEN 'MACHINE_DEPENDENT'
        WHEN exercise.code IN ('goodMorning', 'deadlift', 'barbellRow') THEN 'TECHNIQUE_DEPENDENT'
        ELSE variant.practicality
    END,
    focus_description = CASE
        WHEN exercise.code IN ('pullUp', 'latPulldown') THEN 'Tracción vertical con dorsal como protagonista y ajustes prácticos según agarre y anchura.'
        WHEN exercise.code IN ('seatedCableRow', 'machineRow', 'barbellRow', 'oneArmDumbbellRow') THEN 'Tracción horizontal; la trayectoria determina el sesgo entre dorsal y espalda alta.'
        WHEN exercise.code IN ('benchPress', 'machineChestPress', 'pushUp', 'dip') THEN 'Empuje horizontal con sesgo de pecho o tríceps según agarre y ejecución.'
        WHEN exercise.code IN ('backSquat', 'frontSquat', 'hackSquat', 'legPress', 'lunge', 'splitSquat') THEN 'Patrón dominante de rodilla con contribución de cuádriceps y glúteo sin afirmar aislamiento por postura.'
        WHEN exercise.code IN ('deadlift', 'romanianDeadlift', 'goodMorning') THEN 'Bisagra de cadera orientada a cadena posterior; la técnica modifica el reparto práctico.'
        ELSE 'Enfoque práctico derivado del patrón, postura, equipamiento y trayectoria de la variante.'
    END,
    focus_evidence_type = 'BIOMECHANICAL_INFERENCE',
    focus_evidence_level = 'MEDIUM',
    updated_at = CURRENT_TIMESTAMP
FROM exercises exercise
WHERE variant.exercise_id = exercise.id;

UPDATE exercise_variants
SET primary_focus = CASE
        WHEN grip_type = 'SUPINATED' THEN 'BICEPS_BIAS'
        WHEN grip_type = 'NEUTRAL' THEN 'BRACHIALIS_BRACHIORADIALIS_BIAS'
        WHEN grip_type = 'PRONATED' AND grip_width = 'WIDE' THEN 'BACK_WIDTH'
        ELSE 'GENERAL_STRENGTH' END,
    secondary_focus = 'LAT_BIAS',
    focus_evidence_type = 'INDIRECT_EMG_FROM_SIMILAR_EXERCISE',
    focus_evidence_level = 'MEDIUM'
WHERE code LIKE 'pullUpBodyweight%';

UPDATE exercise_variants SET primary_focus = 'TRICEPS_BIAS', secondary_focus = 'CHEST_STERNAL_BIAS'
WHERE code IN ('benchPressBarbellFlatNarrowGrip', 'pushUpNarrowGrip', 'dipBodyweightUpright');
UPDATE exercise_variants SET primary_focus = 'UPPER_BACK_BIAS', secondary_focus = 'REAR_DELTS_BIAS'
WHERE trajectory IN ('TO_CHEST', 'TO_FACE')
  AND exercise_id IN (SELECT id FROM exercises WHERE movement_pattern IN ('HORIZONTAL_PULL', 'SHOULDER_EXTERNAL_ROTATION'));
UPDATE exercise_variants SET primary_focus = 'LAT_BIAS', secondary_focus = 'UNILATERAL_STABILITY'
WHERE code = 'oneArmDumbbellRowBenchSupported';
UPDATE exercise_variants SET secondary_focus = 'UNILATERAL_STABILITY'
WHERE laterality IN ('UNILATERAL', 'ALTERNATING');
UPDATE exercise_variants SET primary_focus = 'GLUTE_BIAS', secondary_focus = 'ADDUCTOR_BIAS'
WHERE code IN ('legPressMachineHighWideFeet', 'deadliftBarbellSumo');

ALTER TABLE exercise_variants ALTER COLUMN primary_focus SET NOT NULL;

CREATE INDEX idx_exercise_variants_selector
    ON exercise_variants (exercise_id, equipment, grip_type, grip_width, bench_angle, trajectory, active);
CREATE INDEX idx_exercise_activations_variant_role
    ON exercise_muscle_activations (exercise_variant_id, role, activation_level DESC);
