package com.gabri.fitcoreapi.nutrition.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "diet_days")
public class DietDay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "diet_plan_id", nullable = false)
    private DietPlan dietPlan;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "day_order", nullable = false)
    private Integer dayOrder;

    @OneToMany(mappedBy = "dietDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlannedMeal> plannedMeals = new ArrayList<>();

    protected DietDay() {
    }

    public DietDay(String name, Integer dayOrder) {
        this.name = name;
        this.dayOrder = dayOrder;
    }

    public void setDietPlan(DietPlan dietPlan) {
        this.dietPlan = dietPlan;
    }

    public void addPlannedMeal(PlannedMeal plannedMeal) {
        plannedMeals.add(plannedMeal);
        plannedMeal.setDietDay(this);
    }

    public DietPlan getDietPlan() {
        return dietPlan;
    }

    public String getName() {
        return name;
    }

    public Integer getDayOrder() {
        return dayOrder;
    }

    public List<PlannedMeal> getPlannedMeals() {
        return plannedMeals;
    }
}
