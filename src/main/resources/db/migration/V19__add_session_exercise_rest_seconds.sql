ALTER TABLE workout_session_exercises
    ADD COLUMN rest_seconds INTEGER;

UPDATE workout_session_exercises session_exercise
SET rest_seconds = COALESCE(workout_exercise.rest_seconds, 90)
FROM workout_exercises workout_exercise
WHERE session_exercise.workout_exercise_id = workout_exercise.id;

UPDATE workout_session_exercises
SET rest_seconds = 90
WHERE rest_seconds IS NULL;

ALTER TABLE workout_session_exercises
    ALTER COLUMN rest_seconds SET NOT NULL,
    ADD CONSTRAINT chk_workout_session_exercise_rest_seconds
        CHECK (rest_seconds BETWEEN 0 AND 3600);
