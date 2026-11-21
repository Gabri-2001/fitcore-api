package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutDay;
import com.gabri.fitcoreapi.workout.domain.WorkoutDayType;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;

import java.util.Comparator;
import java.util.List;

public record WorkoutDayResponse(
        Long id,
        String name,
        Integer dayOrder,
        WorkoutDayType dayType,
        boolean dayTypeManual,
        List<WorkoutExerciseResponse> exercises
) {
    public static WorkoutDayResponse from(WorkoutDay value) {
        return new WorkoutDayResponse(
                value.getId(), value.getName(), value.getDayOrder(), value.getDayType(), value.isDayTypeManual(),
                value.getWorkoutExercises().stream()
                        .sorted(Comparator.comparing(WorkoutExercise::getExerciseOrder))
                        .map(WorkoutExerciseResponse::from)
                        .toList()
        );
    }
}
