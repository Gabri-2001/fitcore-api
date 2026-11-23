-- Preserve legacy days as manually classified. New clients may opt in to automatic classification.
ALTER TABLE workout_days
    ADD COLUMN day_type_manual BOOLEAN NOT NULL DEFAULT TRUE;
