package com.gabri.fitcoreapi.exercise.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "exercise_variants")
public class ExerciseVariant extends BaseEntity {

    @Column(nullable = false, unique = true, length = 160)
    private String code;
    // Ejemplo: "benchPressBarbellFlatMediumGrip"

    @Column(nullable = false, length = 160)
    private String name;
    // Ejemplo: "Press banca plano con barra agarre medio"

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_facility", nullable = false, length = 40)
    private RequiredFacility requiredFacility = RequiredFacility.NONE;

    @Column(name = "resistance_source", nullable = false, length = 24)
    private String resistanceSource = "EXTERNAL_LOAD";

    @Column(name = "allows_added_weight", nullable = false)
    private boolean allowsAddedWeight;

    @Column(name = "allows_assistance", nullable = false)
    private boolean allowsAssistance;

    @Enumerated(EnumType.STRING)
    @Column(name = "grip_type", length = 50)
    private GripType gripType;

    @Enumerated(EnumType.STRING)
    @Column(name = "grip_width", length = 50)
    private GripWidth gripWidth;

    @Enumerated(EnumType.STRING)
    @Column(name = "bench_angle", length = 50)
    private BenchAngle benchAngle;

    @Enumerated(EnumType.STRING)
    @Column(name = "body_position", length = 50)
    private BodyPosition bodyPosition;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Laterality laterality;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private Trajectory trajectory;

    @Enumerated(EnumType.STRING)
    @Column(name = "support_type", length = 50)
    private SupportType supportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "stance_type", length = 50)
    private StanceType stanceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type", length = 50)
    private AttachmentType attachmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "shoulder_position", length = 50)
    private ShoulderPosition shoulderPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "foot_placement", length = 50)
    private FootPlacement footPlacement;

    @Enumerated(EnumType.STRING)
    @Column(name = "knee_position", length = 50)
    private KneePosition kneePosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "contraction_type", length = 50)
    private ContractionType contractionType;

    @Column(name = "requires_caution", nullable = false)
    private boolean requiresCaution = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_focus", nullable = false, length = 80)
    private ExerciseFocus primaryFocus = ExerciseFocus.GENERAL_STRENGTH;

    @Enumerated(EnumType.STRING)
    @Column(name = "secondary_focus", length = 80)
    private ExerciseFocus secondaryFocus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Practicality practicality = Practicality.COMMON;

    @Column(name = "focus_description", length = 1000)
    private String focusDescription;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "image_alt_text", length = 240)
    private String imageAltText;

    @Enumerated(EnumType.STRING)
    @Column(name = "focus_evidence_type", nullable = false, length = 60)
    private EvidenceType focusEvidenceType = EvidenceType.BIOMECHANICAL_INFERENCE;

    @Enumerated(EnumType.STRING)
    @Column(name = "focus_evidence_level", nullable = false, length = 30)
    private EvidenceLevel focusEvidenceLevel = EvidenceLevel.MEDIUM;

    @Column(name = "is_default", nullable = false)
    private boolean defaultVariant = false;

    @Column(nullable = false)
    private boolean active = true;

    protected ExerciseVariant() {
    }

    public ExerciseVariant(
            String code,
            String name,
            Exercise exercise,
            Equipment equipment,
            GripType gripType,
            GripWidth gripWidth,
            BenchAngle benchAngle,
            BodyPosition bodyPosition,
            Laterality laterality,
            Trajectory trajectory,
            SupportType supportType,
            StanceType stanceType,
            AttachmentType attachmentType,
            ShoulderPosition shoulderPosition,
            FootPlacement footPlacement,
            KneePosition kneePosition,
            ContractionType contractionType,
            boolean requiresCaution
    ) {
        this.code = code;
        this.name = name;
        this.exercise = exercise;
        this.equipment = equipment;
        this.gripType = gripType;
        this.gripWidth = gripWidth;
        this.benchAngle = benchAngle;
        this.bodyPosition = bodyPosition;
        this.laterality = laterality;
        this.trajectory = trajectory;
        this.supportType = supportType;
        this.stanceType = stanceType;
        this.attachmentType = attachmentType;
        this.shoulderPosition = shoulderPosition;
        this.footPlacement = footPlacement;
        this.kneePosition = kneePosition;
        this.contractionType = contractionType;
        this.requiresCaution = requiresCaution;
        this.active = true;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public boolean isDefaultVariant() {
        return defaultVariant;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isRequiresCaution() {
        return requiresCaution;
    }

    public void setRequiresCaution(boolean requiresCaution) {
        this.requiresCaution = requiresCaution;
    }

    public ContractionType getContractionType() {
        return contractionType;
    }

    public void setContractionType(ContractionType contractionType) {
        this.contractionType = contractionType;
    }

    public KneePosition getKneePosition() {
        return kneePosition;
    }

    public void setKneePosition(KneePosition kneePosition) {
        this.kneePosition = kneePosition;
    }

    public FootPlacement getFootPlacement() {
        return footPlacement;
    }

    public void setFootPlacement(FootPlacement footPlacement) {
        this.footPlacement = footPlacement;
    }

    public ShoulderPosition getShoulderPosition() {
        return shoulderPosition;
    }

    public void setShoulderPosition(ShoulderPosition shoulderPosition) {
        this.shoulderPosition = shoulderPosition;
    }

    public AttachmentType getAttachmentType() {
        return attachmentType;
    }

    public void setAttachmentType(AttachmentType attachmentType) {
        this.attachmentType = attachmentType;
    }

    public StanceType getStanceType() {
        return stanceType;
    }

    public void setStanceType(StanceType stanceType) {
        this.stanceType = stanceType;
    }

    public SupportType getSupportType() {
        return supportType;
    }

    public void setSupportType(SupportType supportType) {
        this.supportType = supportType;
    }

    public Trajectory getTrajectory() {
        return trajectory;
    }

    public void setTrajectory(Trajectory trajectory) {
        this.trajectory = trajectory;
    }

    public Laterality getLaterality() {
        return laterality;
    }

    public void setLaterality(Laterality laterality) {
        this.laterality = laterality;
    }

    public BodyPosition getBodyPosition() {
        return bodyPosition;
    }

    public void setBodyPosition(BodyPosition bodyPosition) {
        this.bodyPosition = bodyPosition;
    }

    public BenchAngle getBenchAngle() {
        return benchAngle;
    }

    public void setBenchAngle(BenchAngle benchAngle) {
        this.benchAngle = benchAngle;
    }

    public GripWidth getGripWidth() {
        return gripWidth;
    }

    public void setGripWidth(GripWidth gripWidth) {
        this.gripWidth = gripWidth;
    }

    public GripType getGripType() {
        return gripType;
    }

    public void setGripType(GripType gripType) {
        this.gripType = gripType;
    }

    public RequiredFacility getRequiredFacility() { return requiredFacility; }
    public String getResistanceSource() { return resistanceSource; }
    public boolean isAllowsAddedWeight() { return allowsAddedWeight; }
    public boolean isAllowsAssistance() { return allowsAssistance; }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public String getName() {
        return name;
    }

    public ExerciseFocus getPrimaryFocus() { return primaryFocus; }
    public ExerciseFocus getSecondaryFocus() { return secondaryFocus; }
    public Practicality getPracticality() { return practicality; }
    public String getFocusDescription() { return focusDescription; }
    public String getImageUrl() { return imageUrl; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getImageAltText() { return imageAltText; }
    public EvidenceType getFocusEvidenceType() { return focusEvidenceType; }
    public EvidenceLevel getFocusEvidenceLevel() { return focusEvidenceLevel; }

    public void updateMedia(String imageUrl, String thumbnailUrl, String imageAltText) {
        this.imageUrl = imageUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.imageAltText = imageAltText;
    }

    public void setName(String name) {
        this.name = name;
    }
}
