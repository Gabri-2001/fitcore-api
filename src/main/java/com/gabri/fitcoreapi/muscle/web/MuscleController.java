package com.gabri.fitcoreapi.muscle.web;

import com.gabri.fitcoreapi.muscle.dto.MuscleResponse;
import com.gabri.fitcoreapi.muscle.service.MuscleCatalogService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/muscles")
public class MuscleController {
    private final MuscleCatalogService catalog;
    public MuscleController(MuscleCatalogService catalog) { this.catalog = catalog; }
    @GetMapping public List<MuscleResponse> findAll() { return catalog.findAll().stream().map(MuscleResponse::from).toList(); }
    @GetMapping("/{code}") public MuscleResponse findOne(@PathVariable String code) { return MuscleResponse.from(catalog.findByCode(code)); }
}
