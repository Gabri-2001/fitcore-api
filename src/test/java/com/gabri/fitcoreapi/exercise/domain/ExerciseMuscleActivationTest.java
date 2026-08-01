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
        assertThat(activation.getEvidenceType()).isEqualTo(EvidenceType.DIRECT_EMG);
        assertThat(activation.getEvidenceLevel()).isEqualTo(EvidenceLevel.HIGH);
        assertThat(activation.getSourceRef()).isEqualTo("S10");
        assertThat(activation.getRationale()).isEqualTo("Direct evidence");
    }

    @org.junit.jupiter.api.Test
    void shouldPreserveNormalizedEvidenceMetadata() {
        ExerciseMuscleActivation activation = new ExerciseMuscleActivation(
                null, null, MuscleRole.STABILIZER, "Scapular control",
                EvidenceType.BIOMECHANICAL_INFERENCE, EvidenceLevel.MEDIUM, "S13", 3);

        assertThat(activation.getActivationLevel()).isEqualTo(1);
        assertThat(activation.getEvidenceType()).isEqualTo(EvidenceType.BIOMECHANICAL_INFERENCE);
        assertThat(activation.getEvidenceLevel()).isEqualTo(EvidenceLevel.MEDIUM);
        assertThat(activation.getSourceRef()).isEqualTo("S13");
        assertThat(activation.getMappingVersion()).isEqualTo(3);
    }

    @org.junit.jupiter.api.Test
    void shouldRejectInvalidMappingVersion() {
        assertThatThrownBy(() -> new ExerciseMuscleActivation(
                null, null, MuscleRole.PRIMARY, null,
                EvidenceConfidence.MEDIUM, ActivationSourceType.BIOMECHANICAL_INFERENCE, null, 0))
                .hasMessage("Mapping version must be greater than zero");
    }
}
