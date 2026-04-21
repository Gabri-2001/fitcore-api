package com.gabri.fitcoreapi.nutrition.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "nutrition_log_meal_foods")
public class NutritionLogMealFood extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nutrition_log_meal_id", nullable = false)
    private NutritionLogMeal nutritionLogMeal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FoodUnit unit;

    @Column(name = "calculated_calories", nullable = false, precision = 8, scale = 2)
    private BigDecimal calculatedCalories;

    @Column(name = "calculated_protein", nullable = false, precision = 8, scale = 2)
    private BigDecimal calculatedProtein;

    @Column(name = "calculated_carbs", nullable = false, precision = 8, scale = 2)
    private BigDecimal calculatedCarbs;

    @Column(name = "calculated_fats", nullable = false, precision = 8, scale = 2)
    private BigDecimal calculatedFats;

    protected NutritionLogMealFood() {
    }

    public NutritionLogMealFood(
            Food food,
            BigDecimal quantity,
            FoodUnit unit,
            BigDecimal calculatedCalories,
            BigDecimal calculatedProtein,
            BigDecimal calculatedCarbs,
            BigDecimal calculatedFats
    ) {
        this.food = food;
        this.quantity = quantity;
        this.unit = unit;
        this.calculatedCalories = calculatedCalories;
        this.calculatedProtein = calculatedProtein;
        this.calculatedCarbs = calculatedCarbs;
        this.calculatedFats = calculatedFats;
    }

    public void setNutritionLogMeal(NutritionLogMeal nutritionLogMeal) {
        this.nutritionLogMeal = nutritionLogMeal;
    }

    public NutritionLogMeal getNutritionLogMeal() {
        return nutritionLogMeal;
    }

    public Food getFood() {
        return food;
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