package com.gabri.fitcoreapi.nutrition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateDietPlanRequest {

    @NotBlank(message = "{validation.dietPlan.name.required}")
    private String name;

    private String description;

    @NotNull(message = "{validation.dietPlan.startDate.required}")
    private LocalDate startDate;

    public CreateDietPlanRequest() {
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