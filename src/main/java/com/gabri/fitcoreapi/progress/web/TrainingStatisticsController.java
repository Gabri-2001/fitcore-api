package com.gabri.fitcoreapi.progress.web;

import com.gabri.fitcoreapi.progress.dto.TrainingStatisticsResponse;
import com.gabri.fitcoreapi.progress.service.TrainingStatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/users/{userId}/training-statistics")
@PreAuthorize("@userAccess.isCurrentUser(#userId)")
public class TrainingStatisticsController {

    private final TrainingStatisticsService service;

    public TrainingStatisticsController(TrainingStatisticsService service) {
        this.service = service;
    }

    @GetMapping
    public TrainingStatisticsResponse get(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        LocalDate effectiveTo = to == null ? LocalDate.now() : to;
        LocalDate effectiveFrom = from == null ? effectiveTo.minusDays(29) : from;
        return service.getStatistics(userId, effectiveFrom, effectiveTo);
    }
}
