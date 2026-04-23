package com.gabri.fitcoreapi.nutrition.dto;

import com.gabri.fitcoreapi.nutrition.domain.MealType;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMeal;
import com.gabri.fitcoreapi.nutrition.domain.NutritionMealSourceType;

import java.math.BigDecimal;

public class NutritionLogMealResponse {

    private Long id;
    private Long plannedMealId;
    private String mealName;
    private MealType mealType;
    private NutritionMealSourceType sourceType;
    private Integer mealOrder;
    private String notes;
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFats;

    public NutritionLogMealResponse(
            Long id,
            Long plannedMealId,
            String mealName,
            MealType mealType,
            NutritionMealSourceType sourceType,
            Integer mealOrder,
            String notes,
            BigDecimal totalCalories,
            BigDecimal totalProtein,
            BigDecimal totalCarbs,
            BigDecimal totalFats
    ) {
        this.id = id;
        this.plannedMealId = plannedMealId;
        this.mealName = mealName;
        this.mealType = mealType;
        this.sourceType = sourceType;
        this.mealOrder = mealOrder;
        this.notes = notes;
        this.totalCalories = totalCalories;
        this.totalProtein = totalProtein;
        this.totalCarbs = totalCarbs;
        this.totalFats = totalFats;
    }

    public static NutritionLogMealResponse from(NutritionLogMeal meal) {
        return new NutritionLogMealResponse(
                meal.getId(),
                meal.getPlannedMeal() != null ? meal.getPlannedMeal().getId() : null,
                meal.getMealName(),
                meal.getMealType(),
                meal.getSourceType(),
                meal.getMealOrder(),
                meal.getNotes(),
                meal.getTotalCalories(),
                meal.getTotalProtein(),
                meal.getTotalCarbs(),
                meal.getTotalFats()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getPlannedMealId() {
        return plannedMealId;
    }

    public String getMealName() {
        return mealName;
    }

    public MealType getMealType() {
        return mealType;
    }

    public NutritionMealSourceType getSourceType() {
        return sourceType;
    }

    public Integer getMealOrder() {
        return mealOrder;
    }

    public String getNotes() {
        return notes;
    }

    public BigDecimal getTotalCalories() {
        return totalCalories;
    }

    public BigDecimal getTotalProtein() {
        return totalProtein;
    }

    public BigDecimal getTotalCarbs() {
        return totalCarbs;
    }

    public BigDecimal getTotalFats() {
        return totalFats;
    }
}
