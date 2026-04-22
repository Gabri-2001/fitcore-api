package com.gabri.fitcoreapi.goal.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
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
@Table(name = "goal_profiles")
public class GoalProfile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false, length = 40)
    private GoalType goalType;

    @Column(name = "target_calories", precision = 8, scale = 2)
    private BigDecimal targetCalories;

    @Column(name = "target_protein", precision = 8, scale = 2)
    private BigDecimal targetProtein;

    @Column(name = "target_carbs", precision = 8, scale = 2)
    private BigDecimal targetCarbs;

    @Column(name = "target_fats", precision = 8, scale = 2)
    private BigDecimal targetFats;

    @Column(name = "review_frequency_days")
    private Integer reviewFrequencyDays;

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_goal_profile_id")
    private GoalProfile previousGoalProfile;

    protected GoalProfile() {
    }

    public GoalProfile(
            GoalType goalType,
            BigDecimal targetCalories,
            BigDecimal targetProtein,
            BigDecimal targetCarbs,
            BigDecimal targetFats,
            Integer reviewFrequencyDays,
            Integer version,
            boolean active,
            LocalDate startDate,
            LocalDate endDate
    ) {
        this.goalType = goalType;
        this.targetCalories = targetCalories;
        this.targetProtein = targetProtein;
        this.targetCarbs = targetCarbs;
        this.targetFats = targetFats;
        this.reviewFrequencyDays = reviewFrequencyDays;
        this.version = version;
        this.active = active;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPreviousGoalProfile(GoalProfile previousGoalProfile) {
        this.previousGoalProfile = previousGoalProfile;
    }

    public User getUser() {
        return user;
    }

    public GoalType getGoalType() {
        return goalType;
    }

    public BigDecimal getTargetCalories() {
        return targetCalories;
    }

    public BigDecimal getTargetProtein() {
        return targetProtein;
    }

    public BigDecimal getTargetCarbs() {
        return targetCarbs;
    }

    public BigDecimal getTargetFats() {
        return targetFats;
    }

    public Integer getReviewFrequencyDays() {
        return reviewFrequencyDays;
    }

    public Integer getVersion() {
        return version;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public GoalProfile getPreviousGoalProfile() {
        return previousGoalProfile;
    }

    public void deactivate(LocalDate endDate) {
        this.active = false;
        this.endDate = endDate;
    }
}
