package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutSessionRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutSessionResponse;
import com.gabri.fitcoreapi.workout.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutSessionResponse createWorkoutSession(
            @PathVariable Long userId,
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

        return WorkoutSessionResponse.from(workoutSession);
    }

    @GetMapping
    public List<WorkoutSessionResponse> getWorkoutSessions(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
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
