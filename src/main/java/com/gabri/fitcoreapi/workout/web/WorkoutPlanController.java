package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutPlanRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutPlanResponse;
import com.gabri.fitcoreapi.workout.service.WorkoutPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.util.List;

@Tag(name = "Workout Plans", description = "Operations related to workout planning")
@RestController
@RequestMapping("/api/users/{userId}/workout-plans")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    public WorkoutPlanController(WorkoutPlanService workoutPlanService) {
        this.workoutPlanService = workoutPlanService;
    }

    @Operation(summary = "Create a new workout plan for a user")
    @PostMapping
    public ResponseEntity<WorkoutPlanResponse> createWorkoutPlan(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Valid @RequestBody CreateWorkoutPlanRequest request
    ) {
        WorkoutPlan workoutPlan = workoutPlanService.createWorkoutPlan(
                userId,
                request.getName(),
                request.getDescription(),
                request.getStartDate()
        );

        URI location = URI.create("/api/users/" + userId + "/workout-plans/" + workoutPlan.getId());
        return ResponseEntity.created(location).body(WorkoutPlanResponse.from(workoutPlan));
    }

    @Operation(summary = "Get the active workout plan of a user")
    @GetMapping("/active")
    public WorkoutPlanResponse getActiveWorkoutPlan(@Parameter(description = "User id") @PathVariable Long userId) {
        return WorkoutPlanResponse.from(workoutPlanService.getActiveWorkoutPlan(userId));
    }

    @Operation(summary = "Get workout plan history of a user")
    @GetMapping
    public List<WorkoutPlanResponse> getWorkoutPlanHistory(@Parameter(description = "User id") @PathVariable Long userId) {
        return workoutPlanService.getWorkoutPlanHistory(userId)
                .stream()
                .map(WorkoutPlanResponse::from)
                .toList();
    }
}