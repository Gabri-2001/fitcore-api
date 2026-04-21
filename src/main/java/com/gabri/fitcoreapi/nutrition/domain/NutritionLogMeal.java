package com.gabri.fitcoreapi.nutrition.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nutrition_log_meals")
public class NutritionLogMeal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nutrition_log_id", nullable = false)
    private NutritionLog nutritionLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planned_meal_id")
    private PlannedMeal plannedMeal;

    @Column(name = "meal_name", nullable = false, length = 120)
    private String mealName;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 40)
    private MealType mealType;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 40)
    private NutritionMealSourceType sourceType;

    @Column(name = "meal_order", nullable = false)
    private Integer mealOrder;

    @Column(length = 1500)
    private String notes;

    @Column(name = "total_calories", precision = 8, scale = 2)
    private BigDecimal totalCalories;

    @Column(name = "total_protein", precision = 8, scale = 2)
    private BigDecimal totalProtein;

    @Column(name = "total_carbs", precision = 8, scale = 2)
    private BigDecimal totalCarbs;

    @Column(name = "total_fats", precision = 8, scale = 2)
    private BigDecimal totalFats;

    @OneToMany(mappedBy = "nutritionLogMeal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NutritionLogMealFood> foods = new ArrayList<>();

    protected NutritionLogMeal() {
    }

    public NutritionLogMeal(
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

    public void setNutritionLog(NutritionLog nutritionLog) {
        this.nutritionLog = nutritionLog;
    }

    public void setPlannedMeal(PlannedMeal plannedMeal) {
        this.plannedMeal = plannedMeal;
    }

    public void addFood(NutritionLogMealFood food) {
        foods.add(food);
        food.setNutritionLogMeal(this);
    }

    public NutritionLog getNutritionLog() {
        return nutritionLog;
    }

    public PlannedMeal getPlannedMeal() {
        return plannedMeal;
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

    public List<NutritionLogMealFood> getFoods() {
        return foods;
    }
}
