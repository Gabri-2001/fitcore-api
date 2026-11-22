package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutSessionRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutSessionResponse;
import com.gabri.fitcoreapi.workout.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "Workout Sessions", description = "Operations related to real workout sessions")
@RestController
@RequestMapping("/api/users/{userId}/workout-sessions")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @Operation(summary = "Create a real workout session for a user")
    @PostMapping
    public ResponseEntity<WorkoutSessionResponse> createWorkoutSession(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Valid @RequestBody CreateWorkoutSessionRequest request
    ) {
        WorkoutSession workoutSession = workoutSessionService.createWorkoutSession(
                userId,
                request.getWorkoutDayId(),
                request.getSessionDate(),
                request.getSessionCategory(),
                request.getSessionIntensity(),
                request.getDurationMinutes(),
                request.getNotes(),
                request.getEstimatedTotalCaloriesBurned(),
                request.getMuscleSelectionMode(),
                request.getManualMuscleGroups()
        );

        URI location = URI.create("/api/users/" + userId + "/workout-sessions/" + workoutSession.getId());
        return ResponseEntity.created(location).body(WorkoutSessionResponse.from(workoutSession));
    }

    @Operation(summary = "Get workout sessions of a user, optionally filtered by date range")
    @GetMapping
    public List<WorkoutSessionResponse> getWorkoutSessions(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Start date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<WorkoutSession> sessions;

        if (startDate != null && endDate != null) {
            sessions = workoutSessionService.getWorkoutSessionsByUserAndDateRange(userId, startDate, endDate);
        } else {
            sessions = workoutSessionService.getWorkoutSessionsByUser(userId);
        }

        return sessions.stream()
                .map(WorkoutSessionResponse::from)
                .toList();
    }

    @Operation(summary = "Get a workout session by id")
    @GetMapping("/{workoutSessionId}")
    public WorkoutSessionResponse getWorkoutSessionById(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Workout session id") @PathVariable Long workoutSessionId
    ) {
        return WorkoutSessionResponse.from(
                workoutSessionService.getWorkoutSessionById(userId, workoutSessionId)
        );
    }

    @Operation(summary = "Update an in-progress workout session")
    @PatchMapping("/{workoutSessionId}")
    public WorkoutSessionResponse updateWorkoutSession(
            @PathVariable Long userId,
            @PathVariable Long workoutSessionId,
            @Valid @RequestBody com.gabri.fitcoreapi.workout.dto.UpdateWorkoutSessionRequest request
    ) {
        return WorkoutSessionResponse.from(workoutSessionService.updateWorkoutSession(
                userId, workoutSessionId, request.sessionDate(), request.sessionCategory(),
                request.sessionIntensity(), request.durationMinutes(), request.notes(),
                request.estimatedTotalCaloriesBurned(), request.muscleSelectionMode(),
                request.manualMuscleGroups()));
    }

    @Operation(summary = "Resolve the muscle groups selected manually or inferred from session exercises")
    @GetMapping("/{workoutSessionId}/muscle-groups")
    public List<com.gabri.fitcoreapi.muscle.domain.MuscleGroup> getSessionMuscleGroups(
            @PathVariable Long userId, @PathVariable Long workoutSessionId) {
        return workoutSessionService.getSessionMuscleGroups(userId, workoutSessionId);
    }

    @Operation(summary = "Complete an in-progress workout session")
    @PostMapping("/{workoutSessionId}/complete")
    public WorkoutSessionResponse completeWorkoutSession(@PathVariable Long userId,
            @PathVariable Long workoutSessionId) {
        return WorkoutSessionResponse.from(workoutSessionService.completeWorkoutSession(userId, workoutSessionId));
    }

    @Operation(summary = "Cancel an in-progress workout session")
    @PostMapping("/{workoutSessionId}/cancel")
    public WorkoutSessionResponse cancelWorkoutSession(@PathVariable Long userId,
            @PathVariable Long workoutSessionId) {
        return WorkoutSessionResponse.from(workoutSessionService.cancelWorkoutSession(userId, workoutSessionId));
    }

    @Operation(summary = "Delete a workout session that has not been completed")
    @DeleteMapping("/{workoutSessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkoutSession(@PathVariable Long userId, @PathVariable Long workoutSessionId) {
        workoutSessionService.deleteWorkoutSession(userId, workoutSessionId);
    }
}
