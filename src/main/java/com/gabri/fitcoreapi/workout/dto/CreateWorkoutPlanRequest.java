package com.gabri.fitcoreapi.workout.dto;

import java.time.LocalDate;

public class CreateWorkoutPlanRequest {

    private String name;
    private String description;
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