package com.gabri.fitcoreapi.nutrition.dto;

import com.gabri.fitcoreapi.nutrition.domain.FoodUnit;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMealFood;

import java.math.BigDecimal;

public class NutritionLogMealFoodResponse {

    private Long id;
    private Long foodId;
    private BigDecimal quantity;
    private FoodUnit unit;
    private BigDecimal calculatedCalories;
    private BigDecimal calculatedProtein;
    private BigDecimal calculatedCarbs;
    private BigDecimal calculatedFats;

    public NutritionLogMealFoodResponse(
            Long id,
            Long foodId,
            BigDecimal quantity,
            FoodUnit unit,
            BigDecimal calculatedCalories,
            BigDecimal calculatedProtein,
            BigDecimal calculatedCarbs,
            BigDecimal calculatedFats
    ) {
        this.id = id;
        this.foodId = foodId;
        this.quantity = quantity;
        this.unit = unit;
        this.calculatedCalories = calculatedCalories;
        this.calculatedProtein = calculatedProtein;
        this.calculatedCarbs = calculatedCarbs;
        this.calculatedFats = calculatedFats;
    }

    public static NutritionLogMealFoodResponse from(NutritionLogMealFood mealFood) {
        return new NutritionLogMealFoodResponse(
                mealFood.getId(),
                mealFood.getFood().getId(),
                mealFood.getQuantity(),
                mealFood.getUnit(),
                mealFood.getCalculatedCalories(),
                mealFood.getCalculatedProtein(),
                mealFood.getCalculatedCarbs(),
                mealFood.getCalculatedFats()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getFoodId() {
        return foodId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public FoodUnit getUnit() {
        return unit;
    }

    public BigDecimal getCalculatedCalories() {
        return calculatedCalories;
    }

    public BigDecimal getCalculatedProtein() {
        return calculatedProtein;
    }

    public BigDecimal getCalculatedCarbs() {
        return calculatedCarbs;
    }

    public BigDecimal getCalculatedFats() {
        return calculatedFats;
    }
}