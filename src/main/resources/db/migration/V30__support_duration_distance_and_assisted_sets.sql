-- V30 adds optional per-set metrics while preserving old weight/reps columns.
ALTER TABLE exercise_set_logs
    ADD COLUMN duration_seconds integer,
    ADD COLUMN distance_meters numeric(12,2),
    ADD COLUMN added_weight_kg numeric(8,2),
    ADD COLUMN assistance_weight_kg numeric(8,2),
    ADD COLUMN load_mode varchar(24) NOT NULL DEFAULT 'EXTERNAL_LOAD';
ALTER TABLE exercise_set_logs ADD CONSTRAINT exercise_set_duration_check
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0);
ALTER TABLE exercise_set_logs ADD CONSTRAINT exercise_set_distance_check
  CHECK (distance_meters IS NULL OR distance_meters >= 0);
ALTER TABLE exercise_set_logs ADD CONSTRAINT exercise_set_added_weight_check
  CHECK (added_weight_kg IS NULL OR added_weight_kg >= 0);
ALTER TABLE exercise_set_logs ADD CONSTRAINT exercise_set_assistance_check
  CHECK (assistance_weight_kg IS NULL OR assistance_weight_kg >= 0);
ALTER TABLE exercise_set_logs ADD CONSTRAINT exercise_set_load_mode_check
  CHECK (load_mode IN ('EXTERNAL_LOAD','BODYWEIGHT','WEIGHTED','ASSISTED'));
ALTER TABLE exercise_set_logs ADD CONSTRAINT exercise_set_modes_check
  CHECK (
    (load_mode='WEIGHTED' AND added_weight_kg IS NOT NULL AND assistance_weight_kg IS NULL)
    OR (load_mode='ASSISTED' AND assistance_weight_kg IS NOT NULL AND added_weight_kg IS NULL)
    OR (load_mode IN ('EXTERNAL_LOAD','BODYWEIGHT')
        AND added_weight_kg IS NULL AND assistance_weight_kg IS NULL)
  );
-- Old records do not imply whether weight represented bodyweight or added weight.
-- Keep them as EXTERNAL_LOAD until the user explicitly logs the load mode.
