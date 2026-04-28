package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutSessionExerciseRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutSessionExerciseResponse;
import com.gabri.fitcoreapi.workout.service.WorkoutSessionExerciseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Workout Session Exercises",
        description = "Operations related to performed exercises inside a real workout session"
)
@RestController
@RequestMapping("/api/users/{userId}/workout-sessions/{workoutSessionId}/exercises")
public class WorkoutSessionExerciseController {

    private final WorkoutSessionExerciseService workoutSessionExerciseService;

    public WorkoutSessionExerciseController(WorkoutSessionExerciseService workoutSessionExerciseService) {
        this.workoutSessionExerciseService = workoutSessionExerciseService;
    }

    @Operation(summary = "Add a performed exercise to a workout session")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutSessionExerciseResponse addWorkoutSessionExercise(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Workout session id") @PathVariable Long workoutSessionId,
            @Valid @RequestBody CreateWorkoutSessionExerciseRequest request
    ) {
        WorkoutSessionExercise sessionExercise = workoutSessionExerciseService.addWorkoutSessionExercise(
                userId,
                workoutSessionId,
                request.getWorkoutExerciseId(),
                request.isCompleted(),
                request.getPerformedSets(),
                request.getPerformedReps(),
                request.getPerformedWeightKg(),
                request.getPerformedDurationMinutes(),
                request.getEstimatedCaloriesBurned(),
                request.getNotes()
        );

        return WorkoutSessionExerciseResponse.from(sessionExercise);
    }

    @Operation(summary = "Get all performed exercises of a workout session")
    @GetMapping
    public List<WorkoutSessionExerciseResponse> getWorkoutSessionExercises(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Workout session id") @PathVariable Long workoutSessionId
    ) {
        return workoutSessionExerciseService.getWorkoutSessionExercises(userId, workoutSessionId)
                .stream()
                .map(WorkoutSessionExerciseResponse::from)
                .toList();
    }
}