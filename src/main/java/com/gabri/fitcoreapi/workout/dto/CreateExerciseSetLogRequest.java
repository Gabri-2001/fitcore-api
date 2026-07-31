package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateExerciseSetLogRequest(
        @NotNull @Min(1) Integer setNumber,
        @DecimalMin("0.0") BigDecimal weight,
        @Min(0) Integer reps,
        @Min(0) @Max(10) Integer rir,
        @DecimalMin("0.0") @DecimalMax("10.0") BigDecimal rpe,
        boolean completed,
        @Size(max = 500) String notes) {}
