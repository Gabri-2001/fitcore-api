package com.gabri.fitcoreapi.exercise.web;

import com.gabri.fitcoreapi.exercise.dto.*;
import com.gabri.fitcoreapi.exercise.service.ExerciseCatalogService;
import com.gabri.fitcoreapi.common.dto.PageResponse;
import com.gabri.fitcoreapi.exercise.domain.Equipment;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/exercise-variants")
public class ExerciseVariantController {
    private final ExerciseCatalogService catalog;
    public ExerciseVariantController(ExerciseCatalogService catalog) { this.catalog = catalog; }
    @GetMapping public List<ExerciseVariantResponse> findAll() { return catalog.findVariants().stream().map(ExerciseVariantResponse::from).toList(); }
    @GetMapping("/search")
    public PageResponse<ExerciseVariantResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Set<Equipment> equipment,
            @RequestParam(required = false) Set<String> muscleCode,
            @RequestParam(required = false) Set<MuscleGroup> muscleGroup,
            @RequestParam(defaultValue = "false") boolean includeStabilizers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return PageResponse.from(
                catalog.searchVariants(q, equipment, muscleCode, muscleGroup, includeStabilizers, page, size),
                ExerciseVariantResponse::from
        );
    }
    @GetMapping("/{code}") public ExerciseVariantResponse findOne(@PathVariable String code) { return ExerciseVariantResponse.from(catalog.findVariant(code)); }
    @GetMapping("/{code}/muscle-activations") public List<MuscleActivationResponse> findActivations(@PathVariable String code) {
        return catalog.findActivations(code).stream().map(MuscleActivationResponse::from).toList();
    }
}
