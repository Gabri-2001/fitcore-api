package com.gabri.fitcoreapi.muscle.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "muscles")
public class Muscle extends BaseEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String code;
    // Ejemplo: "LATISSIMUS_DORSI"

    @Column(nullable = false, length = 120)
    private String name;
    // Ejemplo: "Dorsal ancho"

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", nullable = false, length = 40)
    private MuscleGroup muscleGroup;

    @Column(length = 1000)
    private String description;

    @Column(name = "visual_only_region", nullable = false)
    private boolean visualOnlyRegion = false;

    protected Muscle() {
    }
}