package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record ReviseWorkoutPlanRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 1000) String description,
        @NotNull LocalDate effectiveDate,
        @Valid List<CreateWorkoutDayRequest> days
) {
    public ReviseWorkoutPlanRequest {
        days = days == null ? new ArrayList<>() : List.copyOf(days);
    }
}
