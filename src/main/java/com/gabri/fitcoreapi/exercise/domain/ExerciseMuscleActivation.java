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

    protected ExerciseMuscleActivation() {
    }

    public ExerciseMuscleActivation(ExerciseVariant exerciseVariant, Muscle muscle, MuscleRole role, String notes) {
        this.exerciseVariant = exerciseVariant;
        this.muscle = muscle;
        this.role = role;
        this.activationLevel = levelFor(role);
        this.notes = notes;
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
}
