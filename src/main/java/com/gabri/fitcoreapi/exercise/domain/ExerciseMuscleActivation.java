package com.gabri.fitcoreapi.exercise.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.muscle.domain.Muscle;
import com.gabri.fitcoreapi.muscle.domain.MuscleRole;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import jakarta.persistence.*;

@Entity
@Table(
        name = "exercise_muscle_activations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_variant_muscle",
                        columnNames = {"exercise_variant_id", "muscle_id"}
                )
        }
)
public class ExerciseMuscleActivation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_variant_id", nullable = false)
    private ExerciseVariant exerciseVariant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "muscle_id", nullable = false)
    private Muscle muscle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MuscleRole role;

    @Column(name = "activation_level", nullable = false)
    private Integer activationLevel;
    // 3 = primary, 2 = secondary, 1 = stabilizer

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvidenceConfidence confidence = EvidenceConfidence.REVIEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 40)
    private ActivationSourceType sourceType = ActivationSourceType.LEGACY_SEED;

    @Column(name = "source_refs", length = 500)
    private String sourceRefs;

    @Column(name = "mapping_version", nullable = false)
    private Integer mappingVersion = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_type", nullable = false, length = 60)
    private EvidenceType evidenceType = EvidenceType.REVIEW_REQUIRED;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_level", nullable = false, length = 30)
    private EvidenceLevel evidenceLevel = EvidenceLevel.REVIEW;

    @Column(name = "source_ref", length = 80)
    private String sourceRef;

    @Column(length = 1000)
    private String rationale;

    protected ExerciseMuscleActivation() {
    }

    public ExerciseMuscleActivation(ExerciseVariant exerciseVariant, Muscle muscle, MuscleRole role, String notes) {
        this(exerciseVariant, muscle, role, notes, EvidenceConfidence.REVIEW,
                ActivationSourceType.LEGACY_SEED, null, 1);
    }

    public ExerciseMuscleActivation(
            ExerciseVariant exerciseVariant,
            Muscle muscle,
            MuscleRole role,
            String notes,
            EvidenceConfidence confidence,
            ActivationSourceType sourceType,
            String sourceRefs,
            int mappingVersion
    ) {
        this.exerciseVariant = exerciseVariant;
        this.muscle = muscle;
        this.role = role;
        this.activationLevel = levelFor(role);
        this.notes = notes;
        this.confidence = requireConfidence(confidence);
        this.sourceType = requireSourceType(sourceType);
        if (mappingVersion < 1) {
            throw new BusinessRuleException("Mapping version must be greater than zero");
        }
        this.sourceRefs = sourceRefs;
        this.mappingVersion = mappingVersion;
        this.evidenceType = evidenceTypeFor(sourceType);
        this.evidenceLevel = evidenceLevelFor(confidence);
        this.sourceRef = sourceRefs;
        this.rationale = notes;
    }

    public ExerciseMuscleActivation(
            ExerciseVariant exerciseVariant,
            Muscle muscle,
            MuscleRole role,
            String rationale,
            EvidenceType evidenceType,
            EvidenceLevel evidenceLevel,
            String sourceRef,
            int mappingVersion
    ) {
        this.exerciseVariant = exerciseVariant;
        this.muscle = muscle;
        this.role = role;
        this.activationLevel = levelFor(role);
        this.notes = rationale;
        this.confidence = legacyConfidenceFor(evidenceLevel);
        this.sourceType = legacySourceTypeFor(evidenceType);
        this.sourceRefs = sourceRef;
        this.mappingVersion = requireMappingVersion(mappingVersion);
        this.evidenceType = requireEvidenceType(evidenceType);
        this.evidenceLevel = requireEvidenceLevel(evidenceLevel);
        this.sourceRef = sourceRef;
        this.rationale = rationale;
    }

    private static int requireMappingVersion(int mappingVersion) {
        if (mappingVersion < 1) throw new BusinessRuleException("Mapping version must be greater than zero");
        return mappingVersion;
    }

    private static EvidenceType requireEvidenceType(EvidenceType evidenceType) {
        if (evidenceType == null) throw new BusinessRuleException("Evidence type is required");
        return evidenceType;
    }

    private static EvidenceLevel requireEvidenceLevel(EvidenceLevel evidenceLevel) {
        if (evidenceLevel == null) throw new BusinessRuleException("Evidence level is required");
        return evidenceLevel;
    }

    private static EvidenceType evidenceTypeFor(ActivationSourceType sourceType) {
        return switch (sourceType) {
            case PEER_REVIEWED -> EvidenceType.DIRECT_EMG;
            case ANATOMICAL_REFERENCE -> EvidenceType.ANATOMICAL_CONSENSUS;
            case PROFESSIONAL_REFERENCE -> EvidenceType.INDIRECT_EMG_FROM_SIMILAR_EXERCISE;
            case BIOMECHANICAL_INFERENCE, MIXED -> EvidenceType.BIOMECHANICAL_INFERENCE;
            case LEGACY_SEED -> EvidenceType.REVIEW_REQUIRED;
        };
    }

    private static EvidenceLevel evidenceLevelFor(EvidenceConfidence confidence) {
        return switch (confidence) {
            case HIGH -> EvidenceLevel.HIGH;
            case MEDIUM -> EvidenceLevel.MEDIUM;
            case REVIEW -> EvidenceLevel.REVIEW;
        };
    }

    private static ActivationSourceType legacySourceTypeFor(EvidenceType evidenceType) {
        return switch (requireEvidenceType(evidenceType)) {
            case DIRECT_EMG -> ActivationSourceType.PEER_REVIEWED;
            case INDIRECT_EMG_FROM_SIMILAR_EXERCISE -> ActivationSourceType.PROFESSIONAL_REFERENCE;
            case ANATOMICAL_CONSENSUS -> ActivationSourceType.ANATOMICAL_REFERENCE;
            case BIOMECHANICAL_INFERENCE, VISUAL_APPROXIMATION -> ActivationSourceType.BIOMECHANICAL_INFERENCE;
            case REVIEW_REQUIRED -> ActivationSourceType.LEGACY_SEED;
        };
    }

    private static EvidenceConfidence legacyConfidenceFor(EvidenceLevel evidenceLevel) {
        return switch (requireEvidenceLevel(evidenceLevel)) {
            case HIGH -> EvidenceConfidence.HIGH;
            case MEDIUM, LOW -> EvidenceConfidence.MEDIUM;
            case REVIEW -> EvidenceConfidence.REVIEW;
        };
    }

    private static EvidenceConfidence requireConfidence(EvidenceConfidence confidence) {
        if (confidence == null) throw new BusinessRuleException("Evidence confidence is required");
        return confidence;
    }

    private static ActivationSourceType requireSourceType(ActivationSourceType sourceType) {
        if (sourceType == null) throw new BusinessRuleException("Activation source type is required");
        return sourceType;
    }

    private static int levelFor(MuscleRole role) {
        if (role == null) {
            throw new BusinessRuleException("Muscle role is required");
        }
        return switch (role) {
            case PRIMARY -> 3;
            case SECONDARY -> 2;
            case STABILIZER -> 1;
        };
    }

    public ExerciseVariant getExerciseVariant() { return exerciseVariant; }
    public Muscle getMuscle() { return muscle; }
    public MuscleRole getRole() { return role; }
    public Integer getActivationLevel() { return activationLevel; }
    public String getNotes() { return notes; }
    public EvidenceConfidence getConfidence() { return confidence; }
    public ActivationSourceType getSourceType() { return sourceType; }
    public String getSourceRefs() { return sourceRefs; }
    public Integer getMappingVersion() { return mappingVersion; }
    public EvidenceType getEvidenceType() { return evidenceType; }
    public EvidenceLevel getEvidenceLevel() { return evidenceLevel; }
    public String getSourceRef() { return sourceRef; }
    public String getRationale() { return rationale; }
}
