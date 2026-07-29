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

    @Column(nullable = false)
    private boolean active = true;

    protected ExerciseVariant() {
    }
}