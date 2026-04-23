package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateWorkoutPlanRequest {

    @NotBlank(message = "{validation.workoutPlan.name.required}")
    private String name;

    private String description;

    @NotNull(message = "{validation.workoutPlan.startDate.required}")
    private LocalDate startDate;

    public CreateWorkoutPlanRequest() {
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }
}