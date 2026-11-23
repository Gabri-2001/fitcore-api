package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "exercise_set_logs", uniqueConstraints = @UniqueConstraint(
        name = "uk_session_exercise_set_number", columnNames = {"workout_session_exercise_id", "set_number"}))
public class ExerciseSetLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_session_exercise_id", nullable = false)
    private WorkoutSessionExercise workoutSessionExercise;

    @Column(name = "set_number", nullable = false) private Integer setNumber;
    @Column(precision = 8, scale = 2) private BigDecimal weight;
    private Integer reps;
    @Column(name="duration_seconds") private Integer durationSeconds;
    @Column(name="distance_meters", precision=12, scale=2) private BigDecimal distanceMeters;
    @Column(name="added_weight_kg", precision=8, scale=2) private BigDecimal addedWeightKg;
    @Column(name="assistance_weight_kg", precision=8, scale=2) private BigDecimal assistanceWeightKg;
    @Column(name="load_mode", length=24, nullable=false) private String loadMode = "EXTERNAL_LOAD";
    private Integer rir;
    @Column(precision = 3, scale = 1) private BigDecimal rpe;
    @Column(nullable = false) private boolean completed;
    @Column(length = 500) private String notes;

    protected ExerciseSetLog() {}

    public ExerciseSetLog(WorkoutSessionExercise exercise, Integer setNumber, BigDecimal weight,
            Integer reps, Integer rir, BigDecimal rpe, boolean completed, String notes) {
        this.workoutSessionExercise = exercise;
        this.setNumber = setNumber;
        this.weight = weight;
        this.reps = reps;
        this.rir = rir;
        this.rpe = rpe;
        this.completed = completed;
        this.notes = notes;
    }

    public void updateMetrics(Integer durationSeconds, BigDecimal distanceMeters,
            BigDecimal addedWeightKg, BigDecimal assistanceWeightKg, String loadMode) {
        this.durationSeconds = durationSeconds;
        this.distanceMeters = distanceMeters;
        this.addedWeightKg = addedWeightKg;
        this.assistanceWeightKg = assistanceWeightKg;
        this.loadMode = loadMode == null ? "EXTERNAL_LOAD" : loadMode;
    }
    public Integer getDurationSeconds() { return durationSeconds; }
    public BigDecimal getDistanceMeters() { return distanceMeters; }
    public BigDecimal getAddedWeightKg() { return addedWeightKg; }
    public BigDecimal getAssistanceWeightKg() { return assistanceWeightKg; }
    public String getLoadMode() { return loadMode; }

    public WorkoutSessionExercise getWorkoutSessionExercise() { return workoutSessionExercise; }
    public Integer getSetNumber() { return setNumber; }
    public BigDecimal getWeight() { return weight; }
    public Integer getReps() { return reps; }
    public Integer getRir() { return rir; }
    public BigDecimal getRpe() { return rpe; }
    public boolean isCompleted() { return completed; }
    public String getNotes() { return notes; }
    public void update(Integer setNumber, BigDecimal weight, Integer reps, Integer rir,
            BigDecimal rpe, boolean completed, String notes) {
        this.setNumber = setNumber;
        this.weight = weight;
        this.reps = reps;
        this.rir = rir;
        this.rpe = rpe;
        this.completed = completed;
        this.notes = notes;
    }
    public BigDecimal estimatedOneRepMax() {
        // Epley must not use only the extra weight of bodyweight movements.
        if (!completed || !"EXTERNAL_LOAD".equals(loadMode) ||
                weight == null || reps == null || reps <= 0) return BigDecimal.ZERO;
        if(workoutSessionExercise!=null && workoutSessionExercise.getExerciseVariant()!=null &&
            "BODYWEIGHT".equals(workoutSessionExercise.getExerciseVariant().getResistanceSource()))
            return BigDecimal.ZERO;
        return weight.multiply(BigDecimal.ONE.add(BigDecimal.valueOf(reps).divide(
                BigDecimal.valueOf(30),6,java.math.RoundingMode.HALF_UP)));
    }
}
