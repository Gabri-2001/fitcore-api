ALTER TABLE workout_sessions
    ADD COLUMN status varchar(20) NOT NULL DEFAULT 'COMPLETED',
    ADD COLUMN completed_at timestamp(6) with time zone,
    ADD CONSTRAINT chk_workout_session_status
        CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

UPDATE workout_sessions
SET completed_at = updated_at
WHERE status = 'COMPLETED' AND completed_at IS NULL;

ALTER TABLE workout_sessions
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN duration_minutes DROP NOT NULL;

ALTER TABLE goal_profiles
    ADD COLUMN target_weight_kg numeric(5,2),
    ADD COLUMN target_body_fat_percentage numeric(5,2),
    ADD COLUMN target_muscle_mass_kg numeric(5,2),
    ADD COLUMN target_date date,
    ADD COLUMN target_training_days_per_week integer,
    ADD CONSTRAINT chk_goal_target_training_days
        CHECK (target_training_days_per_week IS NULL OR target_training_days_per_week BETWEEN 1 AND 7);

CREATE TABLE goal_profile_muscle_priorities (
    goal_profile_id bigint NOT NULL,
    muscle_group varchar(40) NOT NULL,
    priority_order integer NOT NULL,
    PRIMARY KEY (goal_profile_id, priority_order),
    CONSTRAINT uk_goal_profile_priority_group UNIQUE (goal_profile_id, muscle_group),
    CONSTRAINT fk_goal_profile_muscle_priority
        FOREIGN KEY (goal_profile_id) REFERENCES goal_profiles (id) ON DELETE CASCADE,
    CONSTRAINT chk_goal_priority_muscle_group
        CHECK (muscle_group IN ('CHEST','BACK','SHOULDERS','BICEPS','TRICEPS','QUADRICEPS','HAMSTRINGS','GLUTES','CALVES','CORE','FULL_BODY'))
);

ALTER TABLE workout_days
    ADD CONSTRAINT uk_workout_day_plan_order
        UNIQUE (workout_plan_id, day_order) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE workout_exercises
    ADD CONSTRAINT uk_workout_exercise_day_order
        UNIQUE (workout_day_id, exercise_order) DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX idx_workout_sessions_user_status_date
    ON workout_sessions (user_id, status, session_date);

CREATE INDEX idx_recommendations_user_status_date
    ON plan_adjustment_recommendations (user_id, status, recommendation_date);
