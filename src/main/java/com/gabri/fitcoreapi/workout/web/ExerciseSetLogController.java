package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.dto.*;
import com.gabri.fitcoreapi.workout.service.ExerciseSetLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/workout-session-exercises/{sessionExerciseId}/sets")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class ExerciseSetLogController {
    private final ExerciseSetLogService service;
    public ExerciseSetLogController(ExerciseSetLogService service) { this.service = service; }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ExerciseSetLogResponse create(@PathVariable Long userId, @PathVariable Long sessionExerciseId,
            @Valid @RequestBody CreateExerciseSetLogRequest request) {
        return ExerciseSetLogResponse.from(service.create(userId, sessionExerciseId, request.setNumber(), request.weight(),
                request.reps(), request.rir(), request.rpe(), request.completed(), request.notes()));
    }

    @GetMapping
    public List<ExerciseSetLogResponse> findAll(@PathVariable Long userId, @PathVariable Long sessionExerciseId) {
        return service.findAll(userId, sessionExerciseId).stream().map(ExerciseSetLogResponse::from).toList();
    }
}
