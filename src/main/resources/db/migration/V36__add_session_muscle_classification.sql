-- Separate exercise-derived day classification from legacy session goal and intensity.
ALTER TABLE workout_sessions
    ADD COLUMN training_day_type VARCHAR(40),
    ADD COLUMN training_day_type_manual BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE workout_sessions
    ADD CONSTRAINT chk_session_training_day_type_not_rest
    CHECK (training_day_type IS NULL OR training_day_type <> 'REST');
