INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes, created_at, updated_at)
SELECT variant.id, muscle.id, seed.role, seed.activation_level, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
('benchPressBarbellFlatMediumGrip', 'PECTORAL_MIDDLE', 'PRIMARY', 3),
('benchPressBarbellFlatMediumGrip', 'TRICEPS_BRACHII', 'SECONDARY', 2),
('benchPressBarbellFlatMediumGrip', 'DELTOID_FRONT', 'SECONDARY', 2),
('latPulldownPronatedWideGripToChest', 'LATISSIMUS_DORSI', 'PRIMARY', 3),
('latPulldownPronatedWideGripToChest', 'BICEPS_BRACHII', 'SECONDARY', 2),
('latPulldownPronatedWideGripToChest', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 2),
('seatedCableRowNeutralGrip', 'TRAPEZIUS_MIDDLE', 'PRIMARY', 3),
('seatedCableRowNeutralGrip', 'RHOMBOIDS_REGION', 'PRIMARY', 3),
('seatedCableRowNeutralGrip', 'LATISSIMUS_DORSI', 'SECONDARY', 2),
('seatedCableRowNeutralGrip', 'BICEPS_BRACHII', 'SECONDARY', 2),
('overheadPressBarbellStanding', 'DELTOID_FRONT', 'PRIMARY', 3),
('overheadPressBarbellStanding', 'DELTOID_LATERAL', 'SECONDARY', 2),
('overheadPressBarbellStanding', 'TRICEPS_BRACHII', 'SECONDARY', 2),
('bicepsCurlDumbbellStandingSupinated', 'BICEPS_BRACHII', 'PRIMARY', 3),
('bicepsCurlDumbbellStandingSupinated', 'DELTOID_FRONT', 'STABILIZER', 1),
('tricepsPushdownCableRope', 'TRICEPS_BRACHII', 'PRIMARY', 3),
('backSquatBarbellMediumStance', 'QUADRICEPS', 'PRIMARY', 3),
('backSquatBarbellMediumStance', 'GLUTEUS_MAXIMUS', 'SECONDARY', 2),
('backSquatBarbellMediumStance', 'HAMSTRINGS', 'STABILIZER', 1),
('romanianDeadliftBarbell', 'HAMSTRINGS', 'PRIMARY', 3),
('romanianDeadliftBarbell', 'GLUTEUS_MAXIMUS', 'PRIMARY', 3),
('romanianDeadliftBarbell', 'LATISSIMUS_DORSI', 'STABILIZER', 1),
('barbellHipThrust', 'GLUTEUS_MAXIMUS', 'PRIMARY', 3),
('barbellHipThrust', 'GLUTEUS_MEDIUS', 'SECONDARY', 2),
('barbellHipThrust', 'HAMSTRINGS', 'SECONDARY', 2),
('lateralRaiseDumbbellStanding', 'DELTOID_LATERAL', 'PRIMARY', 3),
('lateralRaiseDumbbellStanding', 'TRAPEZIUS_UPPER', 'SECONDARY', 2),
('standingCalfRaiseBodyweight', 'CALVES', 'PRIMARY', 3),
('crunchBodyweight', 'RECTUS_ABDOMINIS', 'PRIMARY', 3),
('crunchBodyweight', 'OBLIQUES_SERRATUS_REGION', 'SECONDARY', 2)
) AS seed(variant_code, muscle_code, role, activation_level)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;
