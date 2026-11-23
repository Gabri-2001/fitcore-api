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
        return ExerciseSetLogResponse.from(service.createWithMetrics(userId, sessionExerciseId,
                request.setNumber(), request.weight(), request.reps(), request.rir(),
                request.rpe(), request.completed(), request.notes(), request.durationSeconds(),
                request.distanceMeters(), request.addedWeightKg(), request.assistanceWeightKg(), request.loadMode()));
    }

    @GetMapping
    public List<ExerciseSetLogResponse> findAll(@PathVariable Long userId, @PathVariable Long sessionExerciseId) {
        return service.findAll(userId, sessionExerciseId).stream().map(ExerciseSetLogResponse::from).toList();
    }

    @PutMapping("/{setLogId}")
    public ExerciseSetLogResponse update(@PathVariable Long userId, @PathVariable Long sessionExerciseId,
            @PathVariable Long setLogId, @Valid @RequestBody UpdateExerciseSetLogRequest request) {
        return ExerciseSetLogResponse.from(service.updateWithMetrics(userId, sessionExerciseId, setLogId,
                request.setNumber(), request.weight(), request.reps(), request.rir(), request.rpe(),
                request.completed(), request.notes(), request.durationSeconds(), request.distanceMeters(),
                request.addedWeightKg(), request.assistanceWeightKg(), request.loadMode()));
    }

    @DeleteMapping("/{setLogId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long userId, @PathVariable Long sessionExerciseId,
            @PathVariable Long setLogId) {
        service.delete(userId, sessionExerciseId, setLogId);
    }
}
