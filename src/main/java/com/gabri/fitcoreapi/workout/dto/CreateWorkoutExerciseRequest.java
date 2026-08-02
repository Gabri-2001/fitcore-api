package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateWorkoutExerciseRequest {
    @NotBlank
    private String exerciseVariantCode;
    @NotNull @Min(1)
    private Integer sets;
    @NotNull @Min(1)
    private Integer reps;
    @Min(0)
    private Integer restSeconds;
    @NotNull @Min(1)
    private Integer exerciseOrder;

    public CreateWorkoutExerciseRequest() {
    }

    public String getExerciseVariantCode() { return exerciseVariantCode; }
    public Integer getSets() { return sets; }
    public Integer getReps() { return reps; }
    public Integer getRestSeconds() { return restSeconds; }
    public Integer getExerciseOrder() { return exerciseOrder; }
}
