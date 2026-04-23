package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutPlanRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutPlanResponse;
import com.gabri.fitcoreapi.workout.service.WorkoutPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/workout-plans")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    public WorkoutPlanController(WorkoutPlanService workoutPlanService) {
        this.workoutPlanService = workoutPlanService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutPlanResponse createWorkoutPlan(
            @PathVariable Long userId,
            @Valid @RequestBody CreateWorkoutPlanRequest request
    ) {
        WorkoutPlan workoutPlan = workoutPlanService.createWorkoutPlan(
                userId,
                request.getName(),
                request.getDescription(),
                request.getStartDate()
        );

        return WorkoutPlanResponse.from(workoutPlan);
    }

    @GetMapping("/active")
    public WorkoutPlanResponse getActiveWorkoutPlan(@PathVariable Long userId) {
        return WorkoutPlanResponse.from(workoutPlanService.getActiveWorkoutPlan(userId));
    }

    @GetMapping
    public List<WorkoutPlanResponse> getWorkoutPlanHistory(@PathVariable Long userId) {
        return workoutPlanService.getWorkoutPlanHistory(userId)
                .stream()
                .map(WorkoutPlanResponse::from)
                .toList();
    }
}