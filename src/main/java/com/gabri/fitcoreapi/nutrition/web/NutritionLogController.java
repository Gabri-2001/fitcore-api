package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.nutrition.dto.CreateNutritionLogRequest;
import com.gabri.fitcoreapi.nutrition.dto.NutritionLogResponse;
import com.gabri.fitcoreapi.nutrition.service.NutritionLogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/nutrition-logs")
public class NutritionLogController {

    private final NutritionLogService nutritionLogService;

    public NutritionLogController(NutritionLogService nutritionLogService) {
        this.nutritionLogService = nutritionLogService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionLogResponse createNutritionLog(
            @PathVariable Long userId,
            @Valid @RequestBody CreateNutritionLogRequest request
    ) {
        NutritionLog nutritionLog = nutritionLogService.createNutritionLog(
                userId,
                request.getDietDayId(),
                request.getLogDate(),
                request.getMeals()
        );

        return NutritionLogResponse.from(nutritionLog);
    }

    @GetMapping
    public List<NutritionLogResponse> getNutritionLogs(@PathVariable Long userId) {
        return nutritionLogService.getNutritionLogsByUser(userId)
                .stream()
                .map(NutritionLogResponse::from)
                .toList();
    }

    @GetMapping("/by-date")
    public NutritionLogResponse getNutritionLogByDate(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate logDate
    ) {
        return NutritionLogResponse.from(
                nutritionLogService.getNutritionLogByUserAndDate(userId, logDate)
        );
    }
}
