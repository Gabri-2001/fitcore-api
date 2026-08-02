package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReorderWorkoutExercisesRequest(
        @NotEmpty List<@NotNull Long> workoutExerciseIds
) {
}
