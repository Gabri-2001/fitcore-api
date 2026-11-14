package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutSessionExerciseRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutSessionExerciseResponse;
import com.gabri.fitcoreapi.workout.dto.PreviousExercisePerformanceResponse;
import com.gabri.fitcoreapi.workout.dto.UpdateSessionExerciseRestRequest;
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
                request.getRestSeconds(),
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

    @Operation(summary = "Update the rest duration of an exercise in an in-progress session")
    @PatchMapping("/{sessionExerciseId}/rest")
    public WorkoutSessionExerciseResponse updateRestSeconds(
            @PathVariable Long userId,
            @PathVariable Long workoutSessionId,
            @PathVariable Long sessionExerciseId,
            @Valid @RequestBody UpdateSessionExerciseRestRequest request
    ) {
        return WorkoutSessionExerciseResponse.from(
                workoutSessionExerciseService.updateRestSeconds(
                        userId, workoutSessionId, sessionExerciseId, request.restSeconds()));
    }

    @Operation(summary = "Get the completed sets from the latest previous session of this exercise variant")
    @GetMapping("/{sessionExerciseId}/previous-performance")
    public PreviousExercisePerformanceResponse getPreviousPerformance(
            @PathVariable Long userId,
            @PathVariable Long workoutSessionId,
            @PathVariable Long sessionExerciseId
    ) {
        return workoutSessionExerciseService.getPreviousPerformance(userId, workoutSessionId, sessionExerciseId);
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
