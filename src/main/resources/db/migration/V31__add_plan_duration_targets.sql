-- V31: planning time/distance while preserving existing repetition plans.
ALTER TABLE workout_exercises ALTER COLUMN reps DROP NOT NULL;
ALTER TABLE workout_exercises
 ADD COLUMN target_duration_seconds integer,
 ADD COLUMN target_distance_meters numeric(12,2);
ALTER TABLE workout_exercises ADD CONSTRAINT workout_exercises_targets_check
 CHECK ((reps IS NOT NULL AND reps > 0)
        OR (target_duration_seconds IS NOT NULL AND target_duration_seconds > 0)
        OR (target_distance_meters IS NOT NULL AND target_distance_meters > 0));
ALTER TABLE workout_exercises ADD CONSTRAINT workout_exercises_duration_check
 CHECK (target_duration_seconds IS NULL OR target_duration_seconds > 0);
ALTER TABLE workout_exercises ADD CONSTRAINT workout_exercises_distance_check
 CHECK (target_distance_meters IS NULL OR target_distance_meters > 0);
