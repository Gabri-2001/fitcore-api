package com.gabri.fitcoreapi.exercise.domain;

import com.gabri.fitcoreapi.muscle.domain.MuscleRole;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExerciseMuscleActivationTest {
    @ParameterizedTest
    @CsvSource({"PRIMARY,3", "SECONDARY,2", "STABILIZER,1"})
    void shouldDeriveActivationLevelFromRole(MuscleRole role, int expectedLevel) {
        ExerciseMuscleActivation activation = new ExerciseMuscleActivation(null, null, role, null);
        assertThat(activation.getActivationLevel()).isEqualTo(expectedLevel);
    }

    @org.junit.jupiter.api.Test
    void shouldPreserveEvidenceMetadata() {
        ExerciseMuscleActivation activation = new ExerciseMuscleActivation(
                null, null, MuscleRole.PRIMARY, "Direct evidence",
                EvidenceConfidence.HIGH, ActivationSourceType.PEER_REVIEWED, "S10", 2);

        assertThat(activation.getConfidence()).isEqualTo(EvidenceConfidence.HIGH);
        assertThat(activation.getSourceType()).isEqualTo(ActivationSourceType.PEER_REVIEWED);
        assertThat(activation.getSourceRefs()).isEqualTo("S10");
        assertThat(activation.getMappingVersion()).isEqualTo(2);
    }

    @org.junit.jupiter.api.Test
    void shouldRejectInvalidMappingVersion() {
        assertThatThrownBy(() -> new ExerciseMuscleActivation(
                null, null, MuscleRole.PRIMARY, null,
                EvidenceConfidence.MEDIUM, ActivationSourceType.BIOMECHANICAL_INFERENCE, null, 0))
                .hasMessage("Mapping version must be greater than zero");
    }
}
