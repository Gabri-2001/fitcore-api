-- The old session-level category and intensity remain readable for historical
-- clients, but new sessions can rely on exercise/set-level information instead.
ALTER TABLE workout_sessions
    ALTER COLUMN session_category DROP NOT NULL,
    ALTER COLUMN session_intensity DROP NOT NULL,
    ADD COLUMN muscle_selection_mode varchar(12) NOT NULL DEFAULT 'AUTO',
    ADD CONSTRAINT chk_workout_session_muscle_selection_mode
        CHECK (muscle_selection_mode IN ('AUTO', 'MANUAL'));

ALTER TABLE workout_sessions ALTER COLUMN muscle_selection_mode DROP DEFAULT;

CREATE TABLE workout_session_manual_muscle_groups (
    workout_session_id bigint NOT NULL,
    muscle_group varchar(40) NOT NULL,
    PRIMARY KEY (workout_session_id, muscle_group),
    CONSTRAINT fk_session_manual_muscle_group
        FOREIGN KEY (workout_session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE
);
