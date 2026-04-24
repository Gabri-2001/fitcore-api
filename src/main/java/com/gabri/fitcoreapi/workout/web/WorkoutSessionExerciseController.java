package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutSessionExerciseRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutSessionExerciseResponse;
import com.gabri.fitcoreapi.workout.service.WorkoutSessionExerciseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/workout-sessions/{workoutSessionId}/exercises")
public class WorkoutSessionExerciseController {

    private final WorkoutSessionExerciseService workoutSessionExerciseService;

    public WorkoutSessionExerciseController(WorkoutSessionExerciseService workoutSessionExerciseService) {
        this.workoutSessionExerciseService = workoutSessionExerciseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutSessionExerciseResponse addWorkoutSessionExercise(
            @PathVariable Long userId,
            @PathVariable Long workoutSessionId,
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

    @GetMapping
    public List<WorkoutSessionExerciseResponse> getWorkoutSessionExercises(
            @PathVariable Long userId,
            @PathVariable Long workoutSessionId
    ) {
        return workoutSessionExerciseService.getWorkoutSessionExercises(userId, workoutSessionId)
                .stream()
                .map(WorkoutSessionExerciseResponse::from)
                .toList();
    }
}