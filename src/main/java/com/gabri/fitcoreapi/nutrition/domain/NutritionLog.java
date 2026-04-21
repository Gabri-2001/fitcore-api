package com.gabri.fitcoreapi.nutrition.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "nutrition_logs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_nutrition_log_user_date", columnNames = {"user_id", "log_date"})
        }
)
public class NutritionLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diet_day_id")
    private DietDay dietDay;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @OneToMany(mappedBy = "nutritionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NutritionLogMeal> meals = new ArrayList<>();

    protected NutritionLog() {
    }

    public NutritionLog(LocalDate logDate) {
        this.logDate = logDate;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setDietDay(DietDay dietDay) {
        this.dietDay = dietDay;
    }

    public void addMeal(NutritionLogMeal meal) {
        meals.add(meal);
        meal.setNutritionLog(this);
    }

    public User getUser() {
        return user;
    }

    public DietDay getDietDay() {
        return dietDay;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public List<NutritionLogMeal> getMeals() {
        return meals;
    }
}