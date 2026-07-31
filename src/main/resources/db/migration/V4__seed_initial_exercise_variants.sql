INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle, body_position,
    laterality, trajectory, support_type, stance_type, attachment_type, shoulder_position,
    foot_placement, knee_position, contraction_type, requires_caution, active, created_at, updated_at)
SELECT seed.code, seed.name, exercise.id, seed.equipment, seed.grip_type, seed.grip_width,
       seed.bench_angle, seed.body_position, seed.laterality, seed.trajectory, seed.support_type,
       seed.stance_type, seed.attachment_type, seed.shoulder_position, seed.foot_placement,
       seed.knee_position, seed.contraction_type, seed.requires_caution, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
('benchPressBarbellFlatMediumGrip', 'Press banca plano con barra y agarre medio', 'benchPress', 'BARBELL', 'PRONATED', 'MEDIUM', 'FLAT', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false),
('latPulldownPronatedWideGripToChest', 'Jalón al pecho prono y ancho', 'latPulldown', 'CABLE', 'PRONATED', 'WIDE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_CHEST', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'LAT_BAR', 'ARMS_OVERHEAD', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false),
('seatedCableRowNeutralGrip', 'Remo sentado en polea con agarre neutro', 'seatedRow', 'CABLE', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'TO_ABDOMEN', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'V_BAR', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'DYNAMIC', false),
('overheadPressBarbellStanding', 'Press militar de pie con barra', 'overheadPress', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'OVERHEAD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_OVERHEAD', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true),
('bicepsCurlDumbbellStandingSupinated', 'Curl de bíceps de pie con mancuernas', 'bicepsCurl', 'DUMBBELL', 'SUPINATED', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false),
('tricepsPushdownCableRope', 'Extensión de tríceps en polea con cuerda', 'tricepsPushdown', 'CABLE', 'NEUTRAL', 'NARROW', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'ROPE', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false),
('backSquatBarbellMediumStance', 'Sentadilla trasera con barra', 'backSquat', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'FLEXED', 'DYNAMIC', true),
('romanianDeadliftBarbell', 'Peso muerto rumano con barra', 'romanianDeadlift', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true),
('barbellHipThrust', 'Hip thrust con barra', 'hipThrust', 'BARBELL', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'FLAT', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', 'DYNAMIC', false),
('lateralRaiseDumbbellStanding', 'Elevación lateral con mancuernas de pie', 'lateralRaise', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ABDUCTED', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', false),
('standingCalfRaiseBodyweight', 'Elevación de gemelos de pie', 'standingCalfRaise', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'EXTENDED', 'DYNAMIC', false),
('crunchBodyweight', 'Crunch con peso corporal', 'crunch', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false)
) AS seed(code, name, exercise_code, equipment, grip_type, grip_width, bench_angle, body_position,
          laterality, trajectory, support_type, stance_type, attachment_type, shoulder_position,
          foot_placement, knee_position, contraction_type, requires_caution)
JOIN exercises exercise ON exercise.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;
