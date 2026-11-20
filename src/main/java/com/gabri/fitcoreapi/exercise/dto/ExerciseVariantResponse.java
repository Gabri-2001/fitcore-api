package com.gabri.fitcoreapi.exercise.dto;

import com.gabri.fitcoreapi.exercise.domain.*;

public record ExerciseVariantResponse(Long id, String code, String name, String exerciseCode,
        Equipment equipment, GripType gripType, GripWidth gripWidth, BenchAngle benchAngle,
        BodyPosition bodyPosition, Laterality laterality, Trajectory trajectory, SupportType supportType,
        StanceType stanceType, AttachmentType attachmentType, ShoulderPosition shoulderPosition,
        FootPlacement footPlacement, KneePosition kneePosition, ContractionType contractionType,
        ExerciseFocus primaryFocus, ExerciseFocus secondaryFocus, Practicality practicality,
        String focusDescription, String imageUrl, String thumbnailUrl, String imageAltText,
        EvidenceType focusEvidenceType, EvidenceLevel focusEvidenceLevel,
        boolean defaultVariant, boolean requiresCaution, boolean active) {
    public static ExerciseVariantResponse from(ExerciseVariant value) {
        return new ExerciseVariantResponse(value.getId(), value.getCode(), value.getName(), value.getExercise().getCode(),
                value.getEquipment(), value.getGripType(), value.getGripWidth(), value.getBenchAngle(),
                value.getBodyPosition(), value.getLaterality(), value.getTrajectory(), value.getSupportType(),
                value.getStanceType(), value.getAttachmentType(), value.getShoulderPosition(), value.getFootPlacement(),
                value.getKneePosition(), value.getContractionType(), value.getPrimaryFocus(), value.getSecondaryFocus(),
                value.getPracticality(), value.getFocusDescription(), value.getImageUrl(), value.getThumbnailUrl(),
                value.getImageAltText(), value.getFocusEvidenceType(),
                value.getFocusEvidenceLevel(), value.isDefaultVariant(), value.isRequiresCaution(), value.isActive());
    }
}
