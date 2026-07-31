package com.gabri.fitcoreapi.progress.web;

import com.gabri.fitcoreapi.progress.dto.*;
import com.gabri.fitcoreapi.progress.service.ExerciseProgressService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/progress")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class ExerciseProgressController {
    private final ExerciseProgressService service;
    public ExerciseProgressController(ExerciseProgressService service) { this.service = service; }
    @GetMapping("/exercise-variants/{code}") public ExerciseProgressResponse byVariant(@PathVariable Long userId, @PathVariable String code) { return service.byVariant(userId, code); }
    @GetMapping("/exercises/{code}") public ExerciseProgressResponse byExercise(@PathVariable Long userId, @PathVariable String code) { return service.byExercise(userId, code); }
    @GetMapping("/overview") public ProgressOverviewResponse overview(@PathVariable Long userId) { return service.overview(userId); }
    @GetMapping("/muscle-groups") public List<MuscleGroupProgressResponse> muscleGroups(@PathVariable Long userId) { return service.muscleGroups(userId); }
}
