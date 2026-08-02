-- Media metadata belongs to concrete exercise variants. URLs may point to the
-- application's media endpoint or to a CDN; binary image data is not stored here.
ALTER TABLE exercise_variants
    ADD COLUMN image_url varchar(500),
    ADD COLUMN thumbnail_url varchar(500),
    ADD COLUMN image_alt_text varchar(240);

CREATE INDEX idx_exercise_variants_active_equipment_name
    ON exercise_variants (active, equipment, name);
CREATE INDEX idx_exercise_activations_muscle_variant
    ON exercise_muscle_activations (muscle_id, exercise_variant_id, role);
CREATE INDEX idx_workout_exercises_day_order
    ON workout_exercises (workout_day_id, exercise_order);
CREATE INDEX idx_workout_sessions_user_date
    ON workout_sessions (user_id, session_date);
CREATE INDEX idx_progress_records_user_date
    ON progress_records (user_id, record_date);
ALTER TABLE progress_records
    ADD CONSTRAINT uk_progress_records_user_date UNIQUE (user_id, record_date);
