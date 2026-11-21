package com.gabri.fitcoreapi.workout.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

class WorkoutSessionExerciseTest {

    @Test
    void shouldStoreAnEditableRestDuration() {
        WorkoutSessionExercise exercise = new WorkoutSessionExercise(
                null, null, 90, false, 0, 0, null, null, null, null);

        exercise.updateRestSeconds(150);

        assertThat(exercise.getRestSeconds()).isEqualTo(150);
    }

    @Test
    void shouldRejectRestDurationsOutsideTheSupportedRange() {
        WorkoutSessionExercise exercise = new WorkoutSessionExercise(
                null, null, 90, false, 0, 0, null, null, null, null);

        assertThatIllegalArgumentException().isThrownBy(() -> exercise.updateRestSeconds(-1));
        assertThatIllegalArgumentException().isThrownBy(() -> exercise.updateRestSeconds(3601));
    }

    @Test
    void newlyAddedIncompleteSetShouldKeepExerciseInProgress() {
        WorkoutSessionExercise exercise = new WorkoutSessionExercise(
                null, null, 90, false, 0, 0, null, null, null, null);
        exercise.addSetLog(new ExerciseSetLog(exercise, 1, null, 10, 2, null, false, null));

        exercise.synchronizeSetSummary();

        assertThat(exercise.isCompleted()).isFalse();
        assertThat(exercise.getPerformedSets()).isZero();
    }
    @Test
    void finishedTimedSetHasNoInventedRepetitionsOrLoad() {
        WorkoutSessionExercise exercise = new WorkoutSessionExercise(
                null, null, 90, false, 0, 0, null, null, null, null);
        ExerciseSetLog log = new ExerciseSetLog(exercise,1,null,null,null,null,true,null);
        log.updateMetrics(75,null,null,null,"BODYWEIGHT");
        exercise.addSetLog(log);
        exercise.synchronizeSetSummary();
        assertThat(exercise.getPerformedSets()).isEqualTo(1);
        assertThat(exercise.getPerformedReps()).isNull();
        assertThat(exercise.getPerformedWeightKg()).isNull();
        assertThat(exercise.isCompleted()).isTrue();
    }

    @Test
    void historicalBodyweightKgDoNotAppearAsExternalPerformedWeight() {
        var variant = org.mockito.Mockito.mock(com.gabri.fitcoreapi.exercise.domain.ExerciseVariant.class);
        org.mockito.Mockito.when(variant.getResistanceSource()).thenReturn("BODYWEIGHT");
        WorkoutSessionExercise exercise = new WorkoutSessionExercise(
                null, variant, 90, false, 0, 0, null, null, null, null);
        ExerciseSetLog historical=new ExerciseSetLog(exercise,1,
            new java.math.BigDecimal("82"),8,null,null,true,null);
        exercise.addSetLog(historical);
        exercise.synchronizeSetSummary();
        assertThat(exercise.getPerformedReps()).isEqualTo(8);
        assertThat(exercise.getPerformedWeightKg()).isNull();
    }
}
