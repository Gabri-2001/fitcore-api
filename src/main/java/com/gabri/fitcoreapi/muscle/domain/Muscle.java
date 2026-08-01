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

    @Column(name = "has_svg_region", nullable = false)
    private boolean hasSvgRegion = true;

    @Column(nullable = false)
    private boolean active = true;

    protected Muscle() {
    }

    public Muscle(String code, String name, MuscleGroup muscleGroup, String description, boolean visualOnlyRegion) {
        this(code, name, muscleGroup, description, visualOnlyRegion, true);
    }

    public Muscle(String code, String name, MuscleGroup muscleGroup, String description,
                  boolean visualOnlyRegion, boolean hasSvgRegion) {
        this.code = code;
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.description = description;
        this.visualOnlyRegion = visualOnlyRegion;
        this.hasSvgRegion = hasSvgRegion;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public MuscleGroup getMuscleGroup() { return muscleGroup; }
    public String getDescription() { return description; }
    public boolean isVisualOnlyRegion() { return visualOnlyRegion; }
    public boolean isHasSvgRegion() { return hasSvgRegion; }
    public boolean isActive() { return active; }
}
