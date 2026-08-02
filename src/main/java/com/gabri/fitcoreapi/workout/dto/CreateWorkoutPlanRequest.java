package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CreateWorkoutPlanRequest {

    @NotBlank(message = "{validation.workoutPlan.name.required}")
    private String name;

    private String description;

    @NotNull(message = "{validation.workoutPlan.startDate.required}")
    private LocalDate startDate;

    @Valid
    private List<CreateWorkoutDayRequest> days = new ArrayList<>();

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

    public List<CreateWorkoutDayRequest> getDays() {
        return days == null ? List.of() : days;
    }
}
