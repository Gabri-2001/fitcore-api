package com.gabri.fitcoreapi.exercise.dto;

import com.gabri.fitcoreapi.exercise.domain.ExerciseMuscleActivation;
import com.gabri.fitcoreapi.exercise.domain.ActivationSourceType;
import com.gabri.fitcoreapi.exercise.domain.EvidenceConfidence;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.muscle.domain.MuscleRole;

public record MuscleActivationResponse(String muscleCode, String muscleName, MuscleGroup muscleGroup,
        MuscleRole role, int activationLevel, String notes, EvidenceConfidence confidence,
        ActivationSourceType sourceType, String sourceRefs, int mappingVersion) {
    public static MuscleActivationResponse from(ExerciseMuscleActivation value) {
        return new MuscleActivationResponse(value.getMuscle().getCode(), value.getMuscle().getName(),
                value.getMuscle().getMuscleGroup(), value.getRole(), value.getActivationLevel(), value.getNotes(),
                value.getConfidence(), value.getSourceType(), value.getSourceRefs(), value.getMappingVersion());
    }
}
