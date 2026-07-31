package com.gabri.fitcoreapi.exercise.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "exercises")
public class Exercise extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_category", nullable = false, length = 40)
    private ExerciseCategory exerciseCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "main_muscle_group", nullable = false, length = 40)
    private MuscleGroup mainMuscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_pattern", nullable = false, length = 60)
    private MovementPattern movementPattern;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "calories_estimation_type", nullable = false, length = 40)
    private CaloriesEstimationType caloriesEstimationType;

    @Column(name = "base_calories_per_unit", precision = 8, scale = 2)
    private BigDecimal baseCaloriesPerUnit;

    @Column(name = "default_unit", length = 30)
    private String defaultUnit;

    @Column(nullable = false)
    private boolean active = true;

    protected Exercise() {
    }

    public Exercise(
            String code,
            String name,
            ExerciseCategory exerciseCategory,
            MuscleGroup mainMuscleGroup,
            MovementPattern movementPattern,
            String description,
            CaloriesEstimationType caloriesEstimationType,
            BigDecimal baseCaloriesPerUnit,
            String defaultUnit
    ) {
        this.code = code;
        this.name = name;
        this.exerciseCategory = exerciseCategory;
        this.mainMuscleGroup = mainMuscleGroup;
        this.movementPattern = movementPattern;
        this.description = description;
        this.caloriesEstimationType = caloriesEstimationType;
        this.baseCaloriesPerUnit = baseCaloriesPerUnit;
        this.defaultUnit = defaultUnit;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public ExerciseCategory getExerciseCategory() {
        return exerciseCategory;
    }

    public MuscleGroup getMainMuscleGroup() {
        return mainMuscleGroup;
    }

    public MovementPattern getMovementPattern() {
        return movementPattern;
    }

    public String getDescription() {
        return description;
    }


    public CaloriesEstimationType getCaloriesEstimationType() {
        return caloriesEstimationType;
    }

    public BigDecimal getBaseCaloriesPerUnit() {
        return baseCaloriesPerUnit;
    }

    public String getDefaultUnit() {
        return defaultUnit;
    }

    public boolean isActive() {
        return active;
    }
}
