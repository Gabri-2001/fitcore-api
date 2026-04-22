package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;

import java.time.LocalDate;
import java.util.UUID;

public class WorkoutPlanResponse {

    private Long id;
    private UUID planGroupId;
    private String name;
    private String description;
    private Integer version;
    private boolean active;
    private LocalDate startDate;
    private LocalDate endDate;

    public WorkoutPlanResponse(
            Long id,
            UUID planGroupId,
            String name,
            String description,
            Integer version,
            boolean active,
            LocalDate startDate,
            LocalDate endDate
    ) {
        this.id = id;
        this.planGroupId = planGroupId;
        this.name = name;
        this.description = description;
        this.version = version;
        this.active = active;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public static WorkoutPlanResponse from(WorkoutPlan workoutPlan) {
        return new WorkoutPlanResponse(
                workoutPlan.getId(),
                workoutPlan.getPlanGroupId(),
                workoutPlan.getName(),
                workoutPlan.getDescription(),
                workoutPlan.getVersion(),
                workoutPlan.isActive(),
                workoutPlan.getStartDate(),
                workoutPlan.getEndDate()
        );
    }

    public Long getId() {
        return id;
    }

    public UUID getPlanGroupId() {
        return planGroupId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getVersion() {
        return version;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
}