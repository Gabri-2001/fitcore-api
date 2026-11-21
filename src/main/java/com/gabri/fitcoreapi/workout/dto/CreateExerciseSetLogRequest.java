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
        @Size(max = 500) String notes,
        @Min(0) Integer durationSeconds,
        @DecimalMin("0.0") BigDecimal distanceMeters,
        @DecimalMin("0.0") BigDecimal addedWeightKg,
        @DecimalMin("0.0") BigDecimal assistanceWeightKg,
        @Pattern(regexp="EXTERNAL_LOAD|BODYWEIGHT|WEIGHTED|ASSISTED") String loadMode) {}
