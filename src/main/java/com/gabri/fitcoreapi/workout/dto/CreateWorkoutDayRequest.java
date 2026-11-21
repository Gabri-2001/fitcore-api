package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutDayType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class CreateWorkoutDayRequest {
    @NotBlank
    private String name;
    @NotNull @Min(1)
    private Integer dayOrder;
    @NotNull
    private WorkoutDayType dayType;
    // Null means a legacy client: respect the historically selected dayType.
    private Boolean dayTypeManual;

    @Valid
    private List<CreateWorkoutExerciseRequest> exercises = new ArrayList<>();

    public CreateWorkoutDayRequest() {
    }

    public String getName() { return name; }
    public Integer getDayOrder() { return dayOrder; }
    public WorkoutDayType getDayType() { return dayType; }
    public boolean isDayTypeManual() { return dayTypeManual == null || dayTypeManual; }
    public List<CreateWorkoutExerciseRequest> getExercises() { return exercises == null ? List.of() : exercises; }
}
