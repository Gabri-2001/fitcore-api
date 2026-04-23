package com.gabri.fitcoreapi.nutrition.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CreateNutritionLogRequest {

    private Long dietDayId;

    @NotNull(message = "{validation.nutritionLog.logDate.required}")
    private LocalDate logDate;

    @Valid
    private List<CreateNutritionLogMealRequest> meals = new ArrayList<>();

    public CreateNutritionLogRequest() {
    }

    public Long getDietDayId() {
        return dietDayId;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public List<CreateNutritionLogMealRequest> getMeals() {
        return meals;
    }
}