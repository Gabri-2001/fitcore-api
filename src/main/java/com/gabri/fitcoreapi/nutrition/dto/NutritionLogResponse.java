package com.gabri.fitcoreapi.nutrition.dto;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;

import java.time.LocalDate;
import java.util.List;

public class NutritionLogResponse {

    private Long id;
    private Long dietDayId;
    private LocalDate logDate;
    private List<NutritionLogMealResponse> meals;

    public NutritionLogResponse(Long id, Long dietDayId, LocalDate logDate, List<NutritionLogMealResponse> meals) {
        this.id = id;
        this.dietDayId = dietDayId;
        this.logDate = logDate;
        this.meals = meals;
    }

    public static NutritionLogResponse from(NutritionLog nutritionLog) {
        return new NutritionLogResponse(
                nutritionLog.getId(),
                nutritionLog.getDietDay() != null ? nutritionLog.getDietDay().getId() : null,
                nutritionLog.getLogDate(),
                nutritionLog.getMeals().stream()
                        .map(NutritionLogMealResponse::from)
                        .toList()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getDietDayId() {
        return dietDayId;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public List<NutritionLogMealResponse> getMeals() {
        return meals;
    }
}
