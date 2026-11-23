package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;

public record WorkoutExerciseResponse(
        Long id,
        Integer exerciseOrder,
        Integer sets,
        Integer reps,
        Integer targetDurationSeconds,
        java.math.BigDecimal targetDistanceMeters,
        Integer restSeconds,
        String exerciseVariantCode,
        String exerciseVariantName,
        String exerciseCode,
        String imageUrl,
        String thumbnailUrl,
        String imageAltText
) {
    public static WorkoutExerciseResponse from(WorkoutExercise value) {
        ExerciseVariant variant = value.getExerciseVariant();
        return new WorkoutExerciseResponse(
                value.getId(), value.getExerciseOrder(), value.getSets(), value.getReps(),
                value.getTargetDurationSeconds(), value.getTargetDistanceMeters(), value.getRestSeconds(),
                variant.getCode(), variant.getName(), variant.getExercise().getCode(), variant.getImageUrl(),
                variant.getThumbnailUrl(), variant.getImageAltText()
        );
    }
}
