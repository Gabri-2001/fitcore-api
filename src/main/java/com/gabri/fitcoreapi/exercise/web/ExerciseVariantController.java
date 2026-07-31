package com.gabri.fitcoreapi.exercise.web;

import com.gabri.fitcoreapi.exercise.dto.*;
import com.gabri.fitcoreapi.exercise.service.ExerciseCatalogService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exercise-variants")
public class ExerciseVariantController {
    private final ExerciseCatalogService catalog;
    public ExerciseVariantController(ExerciseCatalogService catalog) { this.catalog = catalog; }
    @GetMapping public List<ExerciseVariantResponse> findAll() { return catalog.findVariants().stream().map(ExerciseVariantResponse::from).toList(); }
    @GetMapping("/{code}") public ExerciseVariantResponse findOne(@PathVariable String code) { return ExerciseVariantResponse.from(catalog.findVariant(code)); }
    @GetMapping("/{code}/muscle-activations") public List<MuscleActivationResponse> findActivations(@PathVariable String code) {
        return catalog.findActivations(code).stream().map(MuscleActivationResponse::from).toList();
    }
}
