package com.gabri.fitcoreapi.recommendation.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "plan_adjustment_recommendations")
public class PlanAdjustmentRecommendation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_profile_id", nullable = false)
    private GoalProfile goalProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_plan_id")
    private WorkoutPlan workoutPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diet_plan_id")
    private DietPlan dietPlan;

    @Column(name = "recommendation_date", nullable = false)
    private LocalDate recommendationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false, length = 40)
    private RecommendationType recommendationType;

    @Column(nullable = false, length = 2000)
    private String reason;

    @Column(name = "proposed_calories_change", precision = 8, scale = 2)
    private BigDecimal proposedCaloriesChange;

    @Column(name = "proposed_cardio_change_minutes")
    private Integer proposedCardioChangeMinutes;

    @Column(name = "proposed_sets_change")
    private Integer proposedSetsChange;

    @Column(name = "proposed_reps_change")
    private Integer proposedRepsChange;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecommendationStatus status;

    protected PlanAdjustmentRecommendation() {
    }

    public PlanAdjustmentRecommendation(
            LocalDate recommendationDate,
            RecommendationType recommendationType,
            String reason,
            BigDecimal proposedCaloriesChange,
            Integer proposedCardioChangeMinutes,
            Integer proposedSetsChange,
            Integer proposedRepsChange,
            RecommendationStatus status
    ) {
        this.recommendationDate = recommendationDate;
        this.recommendationType = recommendationType;
        this.reason = reason;
        this.proposedCaloriesChange = proposedCaloriesChange;
        this.proposedCardioChangeMinutes = proposedCardioChangeMinutes;
        this.proposedSetsChange = proposedSetsChange;
        this.proposedRepsChange = proposedRepsChange;
        this.status = status;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setGoalProfile(GoalProfile goalProfile) {
        this.goalProfile = goalProfile;
    }

    public void setWorkoutPlan(WorkoutPlan workoutPlan) {
        this.workoutPlan = workoutPlan;
    }

    public void setDietPlan(DietPlan dietPlan) {
        this.dietPlan = dietPlan;
    }

    public User getUser() {
        return user;
    }

    public GoalProfile getGoalProfile() {
        return goalProfile;
    }

    public WorkoutPlan getWorkoutPlan() {
        return workoutPlan;
    }

    public DietPlan getDietPlan() {
        return dietPlan;
    }

    public LocalDate getRecommendationDate() {
        return recommendationDate;
    }

    public RecommendationType getRecommendationType() {
        return recommendationType;
    }

    public String getReason() {
        return reason;
    }

    public BigDecimal getProposedCaloriesChange() {
        return proposedCaloriesChange;
    }

    public Integer getProposedCardioChangeMinutes() {
        return proposedCardioChangeMinutes;
    }

    public Integer getProposedSetsChange() {
        return proposedSetsChange;
    }

    public Integer getProposedRepsChange() {
        return proposedRepsChange;
    }

    public RecommendationStatus getStatus() {
        return status;
    }
}