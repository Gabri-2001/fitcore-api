package com.gabri.fitcoreapi.nutrition.dto;

import com.gabri.fitcoreapi.nutrition.domain.DietPlan;

import java.time.LocalDate;
import java.util.UUID;

public class DietPlanResponse {

    private Long id;
    private UUID planGroupId;
    private String name;
    private String description;
    private Integer version;
    private boolean active;
    private LocalDate startDate;
    private LocalDate endDate;

    public DietPlanResponse(
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

    public static DietPlanResponse from(DietPlan dietPlan) {
        return new DietPlanResponse(
                dietPlan.getId(),
                dietPlan.getPlanGroupId(),
                dietPlan.getName(),
                dietPlan.getDescription(),
                dietPlan.getVersion(),
                dietPlan.isActive(),
                dietPlan.getStartDate(),
                dietPlan.getEndDate()
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