package com.gabri.fitcoreapi.workout.domain;

/**
 * AUTO calculates the intended muscle groups from exercises in the session.
 * MANUAL uses the user's explicit selection without changing exercise activations.
 */
public enum WorkoutMuscleSelectionMode {
    AUTO,
    MANUAL
}
