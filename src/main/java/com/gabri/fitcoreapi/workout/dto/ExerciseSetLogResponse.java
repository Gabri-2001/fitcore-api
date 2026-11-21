package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import java.math.BigDecimal;

public record ExerciseSetLogResponse(Long id, Integer setNumber, BigDecimal weight, Integer reps,
        Integer rir, BigDecimal rpe, boolean completed, String notes, BigDecimal estimatedOneRepMax,
        Integer durationSeconds, BigDecimal distanceMeters, BigDecimal addedWeightKg,
        BigDecimal assistanceWeightKg, String loadMode) {
    public static ExerciseSetLogResponse from(ExerciseSetLog value) {
        return new ExerciseSetLogResponse(value.getId(), value.getSetNumber(), value.getWeight(), value.getReps(),
                value.getRir(), value.getRpe(), value.isCompleted(), value.getNotes(), value.estimatedOneRepMax(),
                value.getDurationSeconds(), value.getDistanceMeters(), value.getAddedWeightKg(),
                value.getAssistanceWeightKg(), value.getLoadMode());
    }
}
