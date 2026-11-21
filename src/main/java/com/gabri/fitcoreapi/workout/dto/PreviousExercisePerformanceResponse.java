package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public record PreviousExercisePerformanceResponse(
        LocalDate sessionDate,
        List<PreviousSetResponse> sets
) {
    public static PreviousExercisePerformanceResponse empty() {
        return new PreviousExercisePerformanceResponse(null, List.of());
    }

    public static PreviousExercisePerformanceResponse from(WorkoutSessionExercise exercise) {
        List<PreviousSetResponse> completedSets = exercise.getSetLogs().stream()
                .filter(ExerciseSetLog::isCompleted)
                .sorted(Comparator.comparing(ExerciseSetLog::getSetNumber))
                .map(PreviousSetResponse::from)
                .toList();
        return new PreviousExercisePerformanceResponse(
                exercise.getWorkoutSession().getSessionDate(),
                completedSets
        );
    }

    public record PreviousSetResponse(
            Integer setNumber,
            BigDecimal weight,
            Integer reps,
            BigDecimal rpe,
            Integer durationSeconds,
            BigDecimal distanceMeters,
            BigDecimal addedWeightKg,
            BigDecimal assistanceWeightKg,
            String loadMode
    ) {
        private static PreviousSetResponse from(ExerciseSetLog set) {
            return new PreviousSetResponse(set.getSetNumber(), set.getWeight(), set.getReps(),
                    set.getRpe(), set.getDurationSeconds(), set.getDistanceMeters(),
                    set.getAddedWeightKg(), set.getAssistanceWeightKg(), set.getLoadMode());
        }
    }
}
