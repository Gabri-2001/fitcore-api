INSERT INTO exercises (code, name, exercise_category, main_muscle_group, movement_pattern, description,
                       calories_estimation_type, base_calories_per_unit, default_unit, active, created_at, updated_at)
VALUES
('benchPress', 'Press de banca', 'STRENGTH', 'CHEST', 'HORIZONTAL_PUSH', 'Empuje horizontal para pecho.', 'REP_BASED', 0.35, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('latPulldown', 'Jalón al pecho', 'STRENGTH', 'BACK', 'VERTICAL_PULL', 'Tracción vertical para espalda.', 'REP_BASED', 0.30, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('seatedRow', 'Remo sentado', 'STRENGTH', 'BACK', 'HORIZONTAL_PULL', 'Tracción horizontal para espalda.', 'REP_BASED', 0.30, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('overheadPress', 'Press militar', 'STRENGTH', 'SHOULDERS', 'VERTICAL_PUSH', 'Empuje vertical para hombros.', 'REP_BASED', 0.35, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bicepsCurl', 'Curl de bíceps', 'STRENGTH', 'BICEPS', 'ELBOW_FLEXION', 'Flexión de codo para bíceps.', 'REP_BASED', 0.18, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('tricepsPushdown', 'Extensión de tríceps en polea', 'STRENGTH', 'TRICEPS', 'ELBOW_EXTENSION', 'Extensión de codo en polea.', 'REP_BASED', 0.18, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('backSquat', 'Sentadilla trasera', 'STRENGTH', 'QUADRICEPS', 'SQUAT', 'Sentadilla con barra sobre la espalda.', 'REP_BASED', 0.55, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('romanianDeadlift', 'Peso muerto rumano', 'STRENGTH', 'HAMSTRINGS', 'HIP_HINGE', 'Bisagra de cadera para cadena posterior.', 'REP_BASED', 0.50, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('hipThrust', 'Hip thrust', 'STRENGTH', 'GLUTES', 'HIP_EXTENSION', 'Extensión de cadera para glúteos.', 'REP_BASED', 0.40, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lateralRaise', 'Elevación lateral', 'STRENGTH', 'SHOULDERS', 'SHOULDER_ABDUCTION', 'Abducción de hombro.', 'REP_BASED', 0.15, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('standingCalfRaise', 'Elevación de gemelos de pie', 'STRENGTH', 'CALVES', 'ANKLE_PLANTAR_FLEXION', 'Flexión plantar de tobillo.', 'REP_BASED', 0.15, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crunch', 'Crunch', 'CORE', 'CORE', 'TRUNK_FLEXION', 'Flexión de tronco para abdomen.', 'REP_BASED', 0.12, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
