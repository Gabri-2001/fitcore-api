ALTER TABLE IF EXISTS muscles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE IF EXISTS workout_session_exercises
    ADD COLUMN IF NOT EXISTS exercise_variant_id bigint;

UPDATE workout_session_exercises session_exercise
SET exercise_variant_id = workout_exercise.exercise_variant_id
FROM workout_exercises workout_exercise
WHERE session_exercise.workout_exercise_id = workout_exercise.id
  AND session_exercise.exercise_variant_id IS NULL;

ALTER TABLE IF EXISTS workout_session_exercises
    ALTER COLUMN workout_exercise_id DROP NOT NULL;

DO $$
BEGIN
    IF to_regclass('workout_session_exercises') IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM workout_session_exercises WHERE exercise_variant_id IS NULL) THEN
        ALTER TABLE workout_session_exercises ALTER COLUMN exercise_variant_id SET NOT NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('workout_session_exercises') IS NOT NULL
       AND to_regclass('exercise_variants') IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_session_exercise_variant') THEN
        ALTER TABLE workout_session_exercises
            ADD CONSTRAINT fk_session_exercise_variant FOREIGN KEY (exercise_variant_id) REFERENCES exercise_variants(id);
    END IF;
END $$;

DO $$
BEGIN
IF to_regclass('workout_session_exercises') IS NOT NULL THEN
CREATE TABLE IF NOT EXISTS exercise_set_logs (
    id bigserial PRIMARY KEY,
    workout_session_exercise_id bigint NOT NULL REFERENCES workout_session_exercises(id),
    set_number integer NOT NULL,
    weight numeric(8,2),
    reps integer,
    rir integer,
    rpe numeric(3,1),
    completed boolean NOT NULL,
    notes varchar(500),
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_session_exercise_set_number UNIQUE (workout_session_exercise_id, set_number),
    CONSTRAINT ck_exercise_set_number CHECK (set_number > 0),
    CONSTRAINT ck_exercise_set_weight CHECK (weight IS NULL OR weight >= 0),
    CONSTRAINT ck_exercise_set_reps CHECK (reps IS NULL OR reps >= 0),
    CONSTRAINT ck_exercise_set_rir CHECK (rir IS NULL OR rir BETWEEN 0 AND 10),
    CONSTRAINT ck_exercise_set_rpe CHECK (rpe IS NULL OR rpe BETWEEN 0 AND 10)
);
END IF;
END $$;
