package com.gabri.fitcoreapi.exercise.web;

import com.gabri.fitcoreapi.exercise.dto.ExerciseVariantResponse;
import com.gabri.fitcoreapi.exercise.service.ExerciseMediaService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

@RestController
public class ExerciseMediaController {
    private final ExerciseMediaService service;

    public ExerciseMediaController(ExerciseMediaService service) {
        this.service = service;
    }

    @Operation(summary = "Upload or replace an exercise-variant image (administrators only)")
    @PostMapping(path = "/api/exercise-variants/{code}/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ExerciseVariantResponse upload(@PathVariable String code,
            @RequestPart("image") MultipartFile image,
            @RequestParam String altText) {
        return ExerciseVariantResponse.from(service.upload(code, image, altText));
    }

    @GetMapping("/media/exercises/{fileName:.+}")
    public ResponseEntity<Resource> load(@PathVariable String fileName) {
        Resource resource = service.load(fileName);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .contentType(contentType(fileName))
                .body(resource);
    }

    private MediaType contentType(String fileName) {
        String lower = fileName.toLowerCase(java.util.Locale.ROOT);
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }
}
