package com.gabri.fitcoreapi.nutrition.dto;

import java.time.LocalDate;

public class CreateDietPlanRequest {

    private String name;
    private String description;
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