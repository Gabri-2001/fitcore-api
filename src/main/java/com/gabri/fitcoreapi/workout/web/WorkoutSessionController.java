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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "Workout Sessions", description = "Operations related to real workout sessions")
@RestController
@RequestMapping("/api/users/{userId}/workout-sessions")
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
                request.getEstimatedTotalCaloriesBurned()
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
}
