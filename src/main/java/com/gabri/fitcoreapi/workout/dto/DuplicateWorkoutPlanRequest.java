package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DuplicateWorkoutPlanRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull LocalDate startDate
) {
}
