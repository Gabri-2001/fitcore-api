package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import java.math.BigDecimal;

public record ExerciseSetLogResponse(Long id, Integer setNumber, BigDecimal weight, Integer reps,
        Integer rir, BigDecimal rpe, boolean completed, String notes, BigDecimal estimatedOneRepMax) {
    public static ExerciseSetLogResponse from(ExerciseSetLog value) {
        return new ExerciseSetLogResponse(value.getId(), value.getSetNumber(), value.getWeight(), value.getReps(),
                value.getRir(), value.getRpe(), value.isCompleted(), value.getNotes(), value.estimatedOneRepMax());
    }
}
