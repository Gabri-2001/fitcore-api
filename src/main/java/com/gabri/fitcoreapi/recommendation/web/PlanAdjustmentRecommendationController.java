package com.gabri.fitcoreapi.recommendation.web;

import com.gabri.fitcoreapi.recommendation.domain.RecommendationStatus;
import com.gabri.fitcoreapi.recommendation.dto.PlanAdjustmentRecommendationResponse;
import com.gabri.fitcoreapi.recommendation.service.PlanAdjustmentRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Training Recommendations", description = "Evidence-aware training and recovery recommendations")
@RestController
@RequestMapping("/api/users/{userId}/training-recommendations")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class PlanAdjustmentRecommendationController {
    private final PlanAdjustmentRecommendationService service;

    public PlanAdjustmentRecommendationController(PlanAdjustmentRecommendationService service) {
        this.service = service;
    }

    @Operation(summary = "Generate a recommendation from the previous 28 days")
    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public PlanAdjustmentRecommendationResponse generate(@PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return PlanAdjustmentRecommendationResponse.from(service.generate(userId, date));
    }

    @Operation(summary = "List recommendation history, optionally filtered by status")
    @GetMapping
    public List<PlanAdjustmentRecommendationResponse> findAll(@PathVariable Long userId,
            @RequestParam(required = false) RecommendationStatus status) {
        return service.findAll(userId, status).stream().map(PlanAdjustmentRecommendationResponse::from).toList();
    }

    @Operation(summary = "Accept a pending recommendation")
    @PostMapping("/{recommendationId}/accept")
    public PlanAdjustmentRecommendationResponse accept(@PathVariable Long userId,
            @PathVariable Long recommendationId) {
        return PlanAdjustmentRecommendationResponse.from(service.accept(userId, recommendationId));
    }

    @Operation(summary = "Reject a pending recommendation")
    @PostMapping("/{recommendationId}/reject")
    public PlanAdjustmentRecommendationResponse reject(@PathVariable Long userId,
            @PathVariable Long recommendationId) {
        return PlanAdjustmentRecommendationResponse.from(service.reject(userId, recommendationId));
    }
}
