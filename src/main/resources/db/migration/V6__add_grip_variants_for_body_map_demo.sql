INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle, body_position,
    laterality, trajectory, support_type, stance_type, attachment_type, shoulder_position,
    foot_placement, knee_position, contraction_type, requires_caution, active, created_at, updated_at)
SELECT seed.code, seed.name, exercise.id, seed.equipment, seed.grip_type, seed.grip_width,
       seed.bench_angle, seed.body_position, seed.laterality, seed.trajectory, seed.support_type,
       seed.stance_type, seed.attachment_type, seed.shoulder_position, seed.foot_placement,
       seed.knee_position, seed.contraction_type, seed.requires_caution, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('benchPressBarbellFlatNarrowGrip', 'Press banca plano con barra y agarre estrecho', 'benchPress', 'BARBELL', 'PRONATED', 'NARROW', 'FLAT', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false),
    ('benchPressDumbbellFlatNeutralGrip', 'Press banca plano con mancuernas y agarre neutro', 'benchPress', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'FLAT', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false),
    ('latPulldownNeutralMediumGripToChest', 'Jalón al pecho neutro y medio', 'latPulldown', 'CABLE', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_CHEST', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'V_BAR', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false),
    ('latPulldownSupinatedNarrowGripToChest', 'Jalón al pecho supino y estrecho', 'latPulldown', 'CABLE', 'SUPINATED', 'NARROW', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_CHEST', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'STRAIGHT_BAR', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false)
) AS seed(code, name, exercise_code, equipment, grip_type, grip_width, bench_angle, body_position,
          laterality, trajectory, support_type, stance_type, attachment_type, shoulder_position,
          foot_placement, knee_position, contraction_type, requires_caution)
JOIN exercises exercise ON exercise.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes, created_at, updated_at)
SELECT variant.id, muscle.id, seed.role, seed.activation_level, seed.notes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('benchPressBarbellFlatNarrowGrip', 'PECTORAL_MIDDLE', 'SECONDARY', 2, 'El agarre estrecho desplaza parte del énfasis hacia el tríceps.'),
    ('benchPressBarbellFlatNarrowGrip', 'TRICEPS_BRACHII', 'PRIMARY', 3, NULL),
    ('benchPressBarbellFlatNarrowGrip', 'DELTOID_FRONT', 'SECONDARY', 2, NULL),
    ('benchPressDumbbellFlatNeutralGrip', 'PECTORAL_MIDDLE', 'PRIMARY', 3, NULL),
    ('benchPressDumbbellFlatNeutralGrip', 'TRICEPS_BRACHII', 'SECONDARY', 2, NULL),
    ('benchPressDumbbellFlatNeutralGrip', 'DELTOID_FRONT', 'SECONDARY', 2, NULL),
    ('latPulldownNeutralMediumGripToChest', 'LATISSIMUS_DORSI', 'PRIMARY', 3, NULL),
    ('latPulldownNeutralMediumGripToChest', 'BICEPS_BRACHII', 'SECONDARY', 2, NULL),
    ('latPulldownNeutralMediumGripToChest', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 2, NULL),
    ('latPulldownSupinatedNarrowGripToChest', 'LATISSIMUS_DORSI', 'PRIMARY', 3, NULL),
    ('latPulldownSupinatedNarrowGripToChest', 'BICEPS_BRACHII', 'PRIMARY', 3, 'El agarre supino incrementa la participación del bíceps.'),
    ('latPulldownSupinatedNarrowGripToChest', 'TRAPEZIUS_MIDDLE', 'SECONDARY', 2, NULL)
) AS seed(variant_code, muscle_code, role, activation_level, notes)
JOIN exercise_variants variant ON variant.code = seed.variant_code
JOIN muscles muscle ON muscle.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;
