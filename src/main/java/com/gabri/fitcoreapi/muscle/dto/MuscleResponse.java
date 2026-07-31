package com.gabri.fitcoreapi.muscle.dto;

import com.gabri.fitcoreapi.muscle.domain.Muscle;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;

public record MuscleResponse(Long id, String code, String name, MuscleGroup muscleGroup,
        String description, boolean visualOnlyRegion, boolean active) {
    public static MuscleResponse from(Muscle value) {
        return new MuscleResponse(value.getId(), value.getCode(), value.getName(), value.getMuscleGroup(),
                value.getDescription(), value.isVisualOnlyRegion(), value.isActive());
    }
}
