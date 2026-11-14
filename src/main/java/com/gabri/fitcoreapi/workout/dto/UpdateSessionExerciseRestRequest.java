package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateSessionExerciseRestRequest(
        @NotNull @Min(0) @Max(3600) Integer restSeconds
) {
}
