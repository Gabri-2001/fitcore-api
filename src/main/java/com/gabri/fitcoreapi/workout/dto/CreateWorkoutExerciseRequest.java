package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateWorkoutExerciseRequest {
    @NotBlank
    private String exerciseVariantCode;
    @NotNull @Min(1)
    private Integer sets;
    @Min(1)
    private Integer reps;
    @Min(1)
    private Integer targetDurationSeconds;
    @jakarta.validation.constraints.DecimalMin("0.01")
    private java.math.BigDecimal targetDistanceMeters;
    @Min(0)
    private Integer restSeconds;
    @NotNull @Min(1)
    private Integer exerciseOrder;

    public CreateWorkoutExerciseRequest() {
    }

    public String getExerciseVariantCode() { return exerciseVariantCode; }
    public Integer getSets() { return sets; }
    public Integer getReps() { return reps; }
    public Integer getTargetDurationSeconds() { return targetDurationSeconds; }
    public java.math.BigDecimal getTargetDistanceMeters() { return targetDistanceMeters; }
    public Integer getRestSeconds() { return restSeconds; }
    public Integer getExerciseOrder() { return exerciseOrder; }
}
