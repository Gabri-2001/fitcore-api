package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutDay;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record WorkoutPlanDetailResponse(
        Long id,
        UUID planGroupId,
        String name,
        String description,
        Integer version,
        boolean active,
        LocalDate startDate,
        LocalDate endDate,
        List<WorkoutDayResponse> days
) {
    public static WorkoutPlanDetailResponse from(WorkoutPlan value) {
        return new WorkoutPlanDetailResponse(
                value.getId(), value.getPlanGroupId(), value.getName(), value.getDescription(), value.getVersion(),
                value.isActive(), value.getStartDate(), value.getEndDate(),
                value.getWorkoutDays().stream().sorted(Comparator.comparing(WorkoutDay::getDayOrder))
                        .map(WorkoutDayResponse::from).toList()
        );
    }
}
