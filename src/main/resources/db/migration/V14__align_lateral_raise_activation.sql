-- Keep the lateral raise focused on the lateral deltoid, with only a light
-- upper-trapezius contribution as described by the normalized catalog.
DELETE FROM exercise_muscle_activations activation
USING exercise_variants variant, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id
  AND variant.code = 'lateralRaiseDumbbellStanding'
  AND muscle.code IN ('INFRASPINATUS', 'RECTUS_ABDOMINIS');

UPDATE exercise_muscle_activations activation
SET role = 'STABILIZER',
    activation_level = 1,
    evidence_type = 'BIOMECHANICAL_INFERENCE',
    evidence_level = 'MEDIUM',
    source_ref = 'S13',
    rationale = 'Contribución leve a la elevación y control escapular; no es el protagonista del ejercicio.',
    mapping_version = 4,
    updated_at = CURRENT_TIMESTAMP
FROM exercise_variants variant, muscles muscle
WHERE activation.exercise_variant_id = variant.id
  AND activation.muscle_id = muscle.id
  AND variant.code = 'lateralRaiseDumbbellStanding'
  AND muscle.code = 'TRAPEZIUS_UPPER';
