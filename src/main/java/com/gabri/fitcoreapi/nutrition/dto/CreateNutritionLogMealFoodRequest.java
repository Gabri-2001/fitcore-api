package com.gabri.fitcoreapi.nutrition.dto;

import com.gabri.fitcoreapi.nutrition.domain.FoodUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateNutritionLogMealFoodRequest {

    @NotNull(message = "{validation.nutritionLogMealFood.foodId.required}")
    private Long foodId;

    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.nutritionLogMealFood.quantity.positive}")
    private BigDecimal quantity;

    @NotNull(message = "{validation.nutritionLogMealFood.unit.required}")
    private FoodUnit unit;

    private BigDecimal calculatedCalories;
    private BigDecimal calculatedProtein;
    private BigDecimal calculatedCarbs;
    private BigDecimal calculatedFats;

    public CreateNutritionLogMealFoodRequest() {
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
