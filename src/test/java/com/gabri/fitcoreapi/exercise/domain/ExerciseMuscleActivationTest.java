package com.gabri.fitcoreapi.exercise.domain;

import com.gabri.fitcoreapi.muscle.domain.MuscleRole;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.assertj.core.api.Assertions.assertThat;

class ExerciseMuscleActivationTest {
    @ParameterizedTest
    @CsvSource({"PRIMARY,3", "SECONDARY,2", "STABILIZER,1"})
    void shouldDeriveActivationLevelFromRole(MuscleRole role, int expectedLevel) {
        ExerciseMuscleActivation activation = new ExerciseMuscleActivation(null, null, role, null);
        assertThat(activation.getActivationLevel()).isEqualTo(expectedLevel);
    }
}
