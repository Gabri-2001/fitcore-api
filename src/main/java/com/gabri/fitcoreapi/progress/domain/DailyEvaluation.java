package com.gabri.fitcoreapi.progress.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "daily_evaluations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_daily_evaluation_user_date", columnNames = {"user_id", "evaluation_date"})
        }
)
public class DailyEvaluation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_profile_id", nullable = false)
    private GoalProfile goalProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutrition_log_id")
    private NutritionLog nutritionLog;

    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_basis", nullable = false, length = 30)
    private EvaluationBasis evaluationBasis;

    @Column(name = "consumed_calories", precision = 8, scale = 2)
    private BigDecimal consumedCalories;

    @Column(name = "consumed_protein", precision = 8, scale = 2)
    private BigDecimal consumedProtein;

    @Column(name = "consumed_carbs", precision = 8, scale = 2)
    private BigDecimal consumedCarbs;

    @Column(name = "consumed_fats", precision = 8, scale = 2)
    private BigDecimal consumedFats;

    @Column(name = "burned_calories", precision = 8, scale = 2)
    private BigDecimal burnedCalories;

    @Column(name = "target_calories", precision = 8, scale = 2)
    private BigDecimal targetCalories;

    @Column(name = "calorie_balance", precision = 8, scale = 2)
    private BigDecimal calorieBalance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EvaluationStatus status;

    @Column(name = "recommendation_text", length = 2000)
    private String recommendationText;

    protected DailyEvaluation() {
    }

    public DailyEvaluation(
            LocalDate evaluationDate,
            EvaluationBasis evaluationBasis,
            BigDecimal consumedCalories,
            BigDecimal consumedProtein,
            BigDecimal consumedCarbs,
            BigDecimal consumedFats,
            BigDecimal burnedCalories,
            BigDecimal targetCalories,
            BigDecimal calorieBalance,
            EvaluationStatus status,
            String recommendationText
    ) {
        this.evaluationDate = evaluationDate;
        this.evaluationBasis = evaluationBasis;
        this.consumedCalories = consumedCalories;
        this.consumedProtein = consumedProtein;
        this.consumedCarbs = consumedCarbs;
        this.consumedFats = consumedFats;
        this.burnedCalories = burnedCalories;
        this.targetCalories = targetCalories;
        this.calorieBalance = calorieBalance;
        this.status = status;
        this.recommendationText = recommendationText;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setGoalProfile(GoalProfile goalProfile) {
        this.goalProfile = goalProfile;
    }

    public void setNutritionLog(NutritionLog nutritionLog) {
        this.nutritionLog = nutritionLog;
    }

    public User getUser() {
        return user;
    }

    public GoalProfile getGoalProfile() {
        return goalProfile;
    }

    public NutritionLog getNutritionLog() {
        return nutritionLog;
    }

    public LocalDate getEvaluationDate() {
        return evaluationDate;
    }

    public EvaluationBasis getEvaluationBasis() {
        return evaluationBasis;
    }

    public BigDecimal getConsumedCalories() {
        return consumedCalories;
    }

    public BigDecimal getConsumedProtein() {
        return consumedProtein;
    }

    public BigDecimal getConsumedCarbs() {
        return consumedCarbs;
    }

    public BigDecimal getConsumedFats() {
        return consumedFats;
    }

    public BigDecimal getBurnedCalories() {
        return burnedCalories;
    }

    public BigDecimal getTargetCalories() {
        return targetCalories;
    }

    public BigDecimal getCalorieBalance() {
        return calorieBalance;
    }

    public EvaluationStatus getStatus() {
        return status;
    }

    public String getRecommendationText() {
        return recommendationText;
    }
}