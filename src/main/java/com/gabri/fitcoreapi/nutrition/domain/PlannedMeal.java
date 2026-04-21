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

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "planned_meals")
public class PlannedMeal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "diet_day_id", nullable = false)
    private DietDay dietDay;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 40)
    private MealType mealType;

    @Column(name = "meal_order", nullable = false)
    private Integer mealOrder;

    @OneToMany(mappedBy = "plannedMeal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlannedMealFood> plannedMealFoods = new ArrayList<>();

    protected PlannedMeal() {
    }

    public PlannedMeal(String name, MealType mealType, Integer mealOrder) {
        this.name = name;
        this.mealType = mealType;
        this.mealOrder = mealOrder;
    }

    public void setDietDay(DietDay dietDay) {
        this.dietDay = dietDay;
    }

    public void addPlannedMealFood(PlannedMealFood plannedMealFood) {
        plannedMealFoods.add(plannedMealFood);
        plannedMealFood.setPlannedMeal(this);
    }

    public DietDay getDietDay() {
        return dietDay;
    }

    public String getName() {
        return name;
    }

    public MealType getMealType() {
        return mealType;
    }

    public Integer getMealOrder() {
        return mealOrder;
    }

    public List<PlannedMealFood> getPlannedMealFoods() {
        return plannedMealFoods;
    }
}
