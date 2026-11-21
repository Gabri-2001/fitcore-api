package com.gabri.fitcoreapi.workout.domain;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

class ExerciseSetLogTest {
    @Test
    void shouldCalculateEstimatedOneRepMaxUsingEpleyFormula() {
        ExerciseSetLog log = new ExerciseSetLog(null, 1, new BigDecimal("100.00"), 10, 2,
                new BigDecimal("8.0"), true, null);
        assertThat(log.estimatedOneRepMax()).isEqualByComparingTo("133.33330000");
    }

    @Test
    void shouldReturnZeroForIncompleteSet() {
        ExerciseSetLog log = new ExerciseSetLog(null, 1, new BigDecimal("100.00"), 10, null, null, false, null);
        assertThat(log.estimatedOneRepMax()).isEqualByComparingTo(BigDecimal.ZERO);
    }
    @Test
    void timedBodyweightSetsDoNotInventOneRepMaximum() {
        ExerciseSetLog log = new ExerciseSetLog(null,1,null,null,null,null,true,null);
        log.updateMetrics(60,null,new BigDecimal("5"),null,"WEIGHTED");
        assertThat(log.getDurationSeconds()).isEqualTo(60);
        assertThat(log.getAddedWeightKg()).isEqualByComparingTo("5");
        assertThat(log.estimatedOneRepMax()).isEqualByComparingTo("0");
    }
    @Test
    void externalVolumeNeverTreatsBodyMassOrAddedKgAsMachineTonnage() {
        ExerciseSetLog unweighted = new ExerciseSetLog(null, 1, null, 12, null, null, true, null);
        unweighted.updateMetrics(null, null, null, null, "BODYWEIGHT");
        assertThat(WorkoutPerformanceMath.externalVolume(unweighted)).isEqualByComparingTo("0");

        ExerciseSetLog weighted = new ExerciseSetLog(null, 2, null, 8, null, null, true, null);
        weighted.updateMetrics(null, null, new BigDecimal("10"), null, "WEIGHTED");
        assertThat(WorkoutPerformanceMath.externalVolume(weighted)).isEqualByComparingTo("0");

        ExerciseSetLog external = new ExerciseSetLog(null, 3, new BigDecimal("70"), 6, null, null, true, null);
        assertThat(WorkoutPerformanceMath.externalVolume(external)).isEqualByComparingTo("420");
        external.update(3, new BigDecimal("70"), 6, null, null, false, null);
        assertThat(WorkoutPerformanceMath.externalVolume(external)).isEqualByComparingTo("0");
    }
    @Test
    void excludesAmbiguousLegacyBodyweightLoadFromTonnageAndOneRepMax() {
        var parent=org.mockito.Mockito.mock(WorkoutSessionExercise.class,org.mockito.Answers.RETURNS_DEEP_STUBS);
        org.mockito.Mockito.when(parent.getExerciseVariant().getResistanceSource()).thenReturn("BODYWEIGHT");
        ExerciseSetLog old=new ExerciseSetLog(parent,1,new BigDecimal("82"),8,null,null,true,null);
        assertThat(old.getWeight()).isEqualByComparingTo("82");
        assertThat(WorkoutPerformanceMath.externalVolume(old)).isEqualByComparingTo("0");
        assertThat(old.estimatedOneRepMax()).isEqualByComparingTo("0");
    }
}
