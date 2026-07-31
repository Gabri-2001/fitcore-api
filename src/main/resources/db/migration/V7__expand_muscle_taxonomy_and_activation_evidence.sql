ALTER TABLE muscles DROP CONSTRAINT IF EXISTS muscles_muscle_group_check;
ALTER TABLE muscles ADD CONSTRAINT muscles_muscle_group_check CHECK (muscle_group IN (
    'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'QUADRICEPS',
    'HAMSTRINGS', 'GLUTES', 'CALVES', 'CORE', 'NECK', 'FULL_BODY'
));

ALTER TABLE exercise_muscle_activations
    ADD COLUMN confidence varchar(20) NOT NULL DEFAULT 'REVIEW',
    ADD COLUMN source_type varchar(40) NOT NULL DEFAULT 'LEGACY_SEED',
    ADD COLUMN source_refs varchar(500),
    ADD COLUMN mapping_version integer NOT NULL DEFAULT 1,
    ADD CONSTRAINT exercise_activation_confidence_check
        CHECK (confidence IN ('HIGH', 'MEDIUM', 'REVIEW')),
    ADD CONSTRAINT exercise_activation_source_type_check
        CHECK (source_type IN ('PEER_REVIEWED', 'ANATOMICAL_REFERENCE', 'PROFESSIONAL_REFERENCE',
                               'BIOMECHANICAL_INFERENCE', 'MIXED', 'LEGACY_SEED')),
    ADD CONSTRAINT exercise_activation_mapping_version_check CHECK (mapping_version > 0);

COMMENT ON COLUMN exercise_muscle_activations.confidence IS
    'Strength of evidence for this variant-to-muscle classification; not an EMG percentage.';
COMMENT ON COLUMN exercise_muscle_activations.source_refs IS
    'Stable comma-separated source keys resolved by the catalog documentation.';
COMMENT ON COLUMN exercise_muscle_activations.mapping_version IS
    'Version of the activation classification, independent from historical workout logs.';

INSERT INTO muscles (code, name, muscle_group, description, visual_only_region, active, created_at, updated_at)
VALUES
    ('TRAPEZIUS_LOWER', 'Trapecio inferior', 'BACK', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TERES_MAJOR', 'Redondo mayor', 'BACK', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INFRASPINATUS', 'Infraespinoso', 'BACK', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ERECTOR_SPINAE_LUMBAR', 'Erectores espinales lumbares', 'BACK', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BRACHIALIS', 'Braquial', 'BICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BRACHIORADIALIS', 'Braquiorradial', 'FOREARMS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FOREARM_FLEXORS', 'Flexores del antebrazo', 'FOREARMS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FOREARM_EXTENSORS', 'Extensores del antebrazo', 'FOREARMS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRICEPS_LONG_HEAD', 'Tríceps, cabeza larga', 'TRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRICEPS_LATERAL_HEAD', 'Tríceps, cabeza lateral', 'TRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRICEPS_MEDIAL_HEAD', 'Tríceps, cabeza medial', 'TRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('RECTUS_FEMORIS', 'Recto femoral', 'QUADRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VASTUS_MEDIALIS', 'Vasto medial', 'QUADRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VASTUS_LATERALIS', 'Vasto lateral', 'QUADRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SARTORIUS', 'Sartorio', 'QUADRICEPS', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('GASTROCNEMIUS', 'Gastrocnemio', 'CALVES', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SOLEUS', 'Sóleo', 'CALVES', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TIBIALIS_ANTERIOR', 'Tibial anterior', 'CALVES', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PERONEALS', 'Peroneos', 'CALVES', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('STERNOCLEIDOMASTOID', 'Esternocleidomastoideo', 'NECK', NULL, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

UPDATE exercise_muscle_activations activation
SET confidence = evidence.confidence,
    source_type = evidence.source_type,
    source_refs = evidence.source_refs
FROM (VALUES
    ('benchPressBarbellFlatMediumGrip', 'HIGH', 'MIXED', 'S4,S9,S12'),
    ('benchPressBarbellFlatNarrowGrip', 'HIGH', 'MIXED', 'S4,S9'),
    ('benchPressDumbbellFlatNeutralGrip', 'MEDIUM', 'BIOMECHANICAL_INFERENCE', 'S4,S12'),
    ('latPulldownPronatedWideGripToChest', 'HIGH', 'MIXED', 'S5,S10'),
    ('latPulldownNeutralMediumGripToChest', 'MEDIUM', 'MIXED', 'S5,S10'),
    ('latPulldownSupinatedNarrowGripToChest', 'HIGH', 'MIXED', 'S5,S10'),
    ('backSquatBarbellMediumStance', 'HIGH', 'MIXED', 'S6,S11'),
    ('standingCalfRaiseBodyweight', 'HIGH', 'ANATOMICAL_REFERENCE', 'ANATOMY_CALF'),
    ('crunchBodyweight', 'MEDIUM', 'MIXED', 'S22,S23')
) AS evidence(variant_code, confidence, source_type, source_refs)
JOIN exercise_variants variant ON variant.code = evidence.variant_code
WHERE activation.exercise_variant_id = variant.id;
