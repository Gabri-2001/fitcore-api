package com.gabri.fitcoreapi.exercise.web;

import com.gabri.fitcoreapi.exercise.dto.*;
import com.gabri.fitcoreapi.exercise.service.ExerciseCatalogService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {
    private final ExerciseCatalogService catalog;
    public ExerciseController(ExerciseCatalogService catalog) { this.catalog = catalog; }
    @GetMapping public List<ExerciseResponse> findAll() { return catalog.findExercises().stream().map(ExerciseResponse::from).toList(); }
    @GetMapping("/{code}") public ExerciseResponse findOne(@PathVariable String code) { return ExerciseResponse.from(catalog.findExercise(code)); }
    @GetMapping("/{code}/variants") public List<ExerciseVariantResponse> findVariants(@PathVariable String code) {
        return catalog.findVariants(code).stream().map(ExerciseVariantResponse::from).toList();
    }
}
