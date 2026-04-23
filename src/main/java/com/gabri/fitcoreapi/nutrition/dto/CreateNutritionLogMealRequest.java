package com.gabri.fitcoreapi.nutrition.dto;

import com.gabri.fitcoreapi.nutrition.domain.MealType;
import com.gabri.fitcoreapi.nutrition.domain.NutritionMealSourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateNutritionLogMealRequest {

    private Long plannedMealId;

    @NotBlank(message = "{validation.nutritionLogMeal.mealName.required}")
    private String mealName;

    @NotNull(message = "{validation.nutritionLogMeal.mealType.required}")
    private MealType mealType;

    @NotNull(message = "{validation.nutritionLogMeal.sourceType.required}")
    private NutritionMealSourceType sourceType;

    @Min(value = 1, message = "{validation.nutritionLogMeal.mealOrder.min}")
    private Integer mealOrder;

    private String notes;
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFats;

    public CreateNutritionLogMealRequest() {
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
