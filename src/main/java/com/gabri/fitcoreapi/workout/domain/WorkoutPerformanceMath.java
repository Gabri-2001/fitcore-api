package com.gabri.fitcoreapi.workout.domain;

import java.math.BigDecimal;

/**
 * Shared, conservative metrics. Volume is external kilogram-repetitions only.
 * Body mass, assistance and added weight are tracked separately, never
 * silently mixed with machine/barbell volume.
 */
public final class WorkoutPerformanceMath {
    private WorkoutPerformanceMath() {}

    public static BigDecimal externalVolume(ExerciseSetLog log) {
        if (!log.isCompleted() || !"EXTERNAL_LOAD".equals(log.getLoadMode())
                || log.getWeight() == null || log.getReps() == null
                || log.getReps() <= 0 || log.getWeight().signum() < 0) {
            return BigDecimal.ZERO;
        }
        var parent=log.getWorkoutSessionExercise();
        if(parent!=null && parent.getExerciseVariant()!=null &&
                "BODYWEIGHT".equals(parent.getExerciseVariant().getResistanceSource()))
            return BigDecimal.ZERO;
        return log.getWeight().multiply(BigDecimal.valueOf(log.getReps()));
    }
}
