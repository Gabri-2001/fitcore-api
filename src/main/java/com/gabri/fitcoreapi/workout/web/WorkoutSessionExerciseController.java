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
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@Tag(
        name = "Workout Session Exercises",
        description = "Operations related to performed exercises inside a real workout session"
)
@RestController
@RequestMapping("/api/users/{userId}/workout-sessions/{workoutSessionId}/exercises")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
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
                request.getExerciseVariantCode(),
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

    @Operation(summary = "Update a performed exercise in an in-progress session")
    @PutMapping("/{sessionExerciseId}")
    public WorkoutSessionExerciseResponse updateWorkoutSessionExercise(
            @PathVariable Long userId,
            @PathVariable Long workoutSessionId,
            @PathVariable Long sessionExerciseId,
            @Valid @RequestBody com.gabri.fitcoreapi.workout.dto.UpdateWorkoutSessionExerciseRequest request
    ) {
        return WorkoutSessionExerciseResponse.from(
                workoutSessionExerciseService.updateWorkoutSessionExercise(
                        userId, workoutSessionId, sessionExerciseId, request.completed(),
                        request.performedSets(), request.performedReps(), request.performedWeightKg(),
                        request.performedDurationMinutes(), request.estimatedCaloriesBurned(), request.notes()));
    }

    @Operation(summary = "Delete a performed exercise from an in-progress session")
    @DeleteMapping("/{sessionExerciseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkoutSessionExercise(@PathVariable Long userId, @PathVariable Long workoutSessionId,
            @PathVariable Long sessionExerciseId) {
        workoutSessionExerciseService.deleteWorkoutSessionExercise(userId, workoutSessionId, sessionExerciseId);
    }
}
