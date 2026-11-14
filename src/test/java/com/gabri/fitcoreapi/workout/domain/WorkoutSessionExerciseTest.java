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
}
