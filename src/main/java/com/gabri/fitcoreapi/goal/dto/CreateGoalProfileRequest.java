package com.gabri.fitcoreapi.goal.dto;

import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CreateGoalProfileRequest {

    @NotNull(message = "{validation.goal.goalType.required}")
    private GoalType goalType;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetCalories.min}")
    private BigDecimal targetCalories;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetProtein.min}")
    private BigDecimal targetProtein;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetCarbs.min}")
    private BigDecimal targetCarbs;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetFats.min}")
    private BigDecimal targetFats;

    @Min(value = 1, message = "{validation.goal.reviewFrequency.min}")
    private Integer reviewFrequencyDays;

    @DecimalMin(value = "1.0")
    private BigDecimal targetWeightKg;

    @DecimalMin(value = "0.0")
    private BigDecimal targetBodyFatPercentage;

    @DecimalMin(value = "0.0")
    private BigDecimal targetMuscleMassKg;

    private LocalDate targetDate;

    @Min(1)
    @jakarta.validation.constraints.Max(7)
    private Integer targetTrainingDaysPerWeek;

    private List<MuscleGroup> priorityMuscleGroups = new ArrayList<>();

    @NotNull(message = "{validation.goal.startDate.required}")
    private LocalDate startDate;


    public CreateGoalProfileRequest() {
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public BigDecimal getTargetWeightKg() { return targetWeightKg; }
    public BigDecimal getTargetBodyFatPercentage() { return targetBodyFatPercentage; }
    public BigDecimal getTargetMuscleMassKg() { return targetMuscleMassKg; }
    public LocalDate getTargetDate() { return targetDate; }
    public Integer getTargetTrainingDaysPerWeek() { return targetTrainingDaysPerWeek; }
    public List<MuscleGroup> getPriorityMuscleGroups() {
        return priorityMuscleGroups == null ? List.of() : List.copyOf(priorityMuscleGroups);
    }
}
