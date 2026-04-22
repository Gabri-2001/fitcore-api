package com.gabri.fitcoreapi.exercise.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "exercises")
public class Exercise extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_category", nullable = false, length = 40)
    private ExerciseCategory exerciseCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", nullable = false, length = 40)
    private MuscleGroup muscleGroup;

    @Column(length = 1000)
    private String description;

    @Column(length = 120)
    private String equipment;

    @Enumerated(EnumType.STRING)
    @Column(name = "calories_estimation_type", nullable = false, length = 40)
    private CaloriesEstimationType caloriesEstimationType;

    @Column(name = "base_calories_per_unit", precision = 8, scale = 2)
    private BigDecimal baseCaloriesPerUnit;

    @Column(name = "default_unit", length = 30)
    private String defaultUnit;

    protected Exercise() {
    }

    public Exercise(
            String name,
            ExerciseCategory exerciseCategory,
            MuscleGroup muscleGroup,
            String description,
            String equipment,
            CaloriesEstimationType caloriesEstimationType,
            BigDecimal baseCaloriesPerUnit,
            String defaultUnit
    ) {
        this.name = name;
        this.exerciseCategory = exerciseCategory;
        this.muscleGroup = muscleGroup;
        this.description = description;
        this.equipment = equipment;
        this.caloriesEstimationType = caloriesEstimationType;
        this.baseCaloriesPerUnit = baseCaloriesPerUnit;
        this.defaultUnit = defaultUnit;
    }

    public String getName() {
        return name;
    }

    public ExerciseCategory getExerciseCategory() {
        return exerciseCategory;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public String getDescription() {
        return description;
    }

    public String getEquipment() {
        return equipment;
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
}
