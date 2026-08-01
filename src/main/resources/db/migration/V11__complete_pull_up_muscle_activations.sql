INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version, created_at, updated_at)
SELECT variant.id, muscle.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       seed.notes, seed.confidence, seed.source_type, seed.source_refs, 1,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('pullUpPronatedWideGrip', 'BRACHIALIS', 'SECONDARY', 'HIGH', 'ANATOMICAL_REFERENCE', 'S15,S19', NULL),
    ('pullUpPronatedWideGrip', 'BRACHIORADIALIS', 'SECONDARY', 'MEDIUM', 'ANATOMICAL_REFERENCE', 'S15,S19', NULL),
    ('pullUpPronatedWideGrip', 'TRAPEZIUS_LOWER', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S19', NULL),
    ('pullUpPronatedWideGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S19', NULL),
    ('pullUpPronatedWideGrip', 'DELTOID_REAR', 'SECONDARY', 'MEDIUM', 'MIXED', 'S10,S14', NULL),
    ('pullUpPronatedWideGrip', 'FOREARM_FLEXORS', 'STABILIZER', 'MEDIUM', 'BIOMECHANICAL_INFERENCE', 'S19', 'Mantienen el agarre durante la tracción.'),
    ('pullUpPronatedWideGrip', 'INFRASPINATUS', 'STABILIZER', 'MEDIUM', 'ANATOMICAL_REFERENCE', 'S14', 'Estabilización glenohumeral durante la tracción.'),
    ('pullUpPronatedWideGrip', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'REVIEW', 'BIOMECHANICAL_INFERENCE', 'CATALOG_V1', 'Estabilización isométrica del tronco; depende de la técnica.'),

    ('chinUpSupinatedNarrowGrip', 'BRACHIORADIALIS', 'SECONDARY', 'MEDIUM', 'ANATOMICAL_REFERENCE', 'S15,S18', NULL),
    ('chinUpSupinatedNarrowGrip', 'TERES_MAJOR', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S10,S18', NULL),
    ('chinUpSupinatedNarrowGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S18', NULL),
    ('chinUpSupinatedNarrowGrip', 'TRAPEZIUS_LOWER', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S18', NULL),
    ('chinUpSupinatedNarrowGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S18', NULL),
    ('chinUpSupinatedNarrowGrip', 'DELTOID_REAR', 'SECONDARY', 'MEDIUM', 'MIXED', 'S10,S14', NULL),
    ('chinUpSupinatedNarrowGrip', 'FOREARM_FLEXORS', 'STABILIZER', 'MEDIUM', 'BIOMECHANICAL_INFERENCE', 'S18', 'Mantienen el agarre durante la tracción.'),
    ('chinUpSupinatedNarrowGrip', 'INFRASPINATUS', 'STABILIZER', 'MEDIUM', 'ANATOMICAL_REFERENCE', 'S14', 'Estabilización glenohumeral durante la tracción.'),
    ('chinUpSupinatedNarrowGrip', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'REVIEW', 'BIOMECHANICAL_INFERENCE', 'CATALOG_V1', 'Estabilización isométrica del tronco; depende de la técnica.'),

    ('pullUpNeutralMediumGrip', 'BICEPS_BRACHII', 'SECONDARY', 'HIGH', 'ANATOMICAL_REFERENCE', 'S15,S19', NULL),
    ('pullUpNeutralMediumGrip', 'TERES_MAJOR', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S10,S19', NULL),
    ('pullUpNeutralMediumGrip', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S19', NULL),
    ('pullUpNeutralMediumGrip', 'TRAPEZIUS_LOWER', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S19', NULL),
    ('pullUpNeutralMediumGrip', 'RHOMBOIDS_REGION', 'SECONDARY', 'MEDIUM', 'MIXED', 'S5,S13,S19', NULL),
    ('pullUpNeutralMediumGrip', 'DELTOID_REAR', 'SECONDARY', 'MEDIUM', 'MIXED', 'S10,S14', NULL),
    ('pullUpNeutralMediumGrip', 'FOREARM_FLEXORS', 'STABILIZER', 'MEDIUM', 'BIOMECHANICAL_INFERENCE', 'S19', 'Mantienen el agarre durante la tracción.'),
    ('pullUpNeutralMediumGrip', 'INFRASPINATUS', 'STABILIZER', 'MEDIUM', 'ANATOMICAL_REFERENCE', 'S14', 'Estabilización glenohumeral durante la tracción.'),
    ('pullUpNeutralMediumGrip', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'REVIEW', 'BIOMECHANICAL_INFERENCE', 'CATALOG_V1', 'Estabilización isométrica del tronco; depende de la técnica.')
) AS seed(variant_code, muscle_code, role, confidence, source_type, source_refs, notes)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;
