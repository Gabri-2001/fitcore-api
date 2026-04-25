package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.nutrition.dto.CreateNutritionLogRequest;
import com.gabri.fitcoreapi.nutrition.dto.NutritionLogResponse;
import com.gabri.fitcoreapi.nutrition.service.NutritionLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Nutrition Logs", description = "Operations related to real nutrition logs")
@RestController
@RequestMapping("/api/users/{userId}/nutrition-logs")
public class NutritionLogController {

    private final NutritionLogService nutritionLogService;

    public NutritionLogController(NutritionLogService nutritionLogService) {
        this.nutritionLogService = nutritionLogService;
    }

    @Operation(summary = "Create a nutrition log for a user")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionLogResponse createNutritionLog(
            @Parameter(description = "User id")  @PathVariable Long userId,
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

    @Operation(summary = "Get all nutrition logs of a user")
    @GetMapping
    public List<NutritionLogResponse> getNutritionLogs(@Parameter(description = "User id") @PathVariable Long userId) {
        return nutritionLogService.getNutritionLogsByUser(userId)
                .stream()
                .map(NutritionLogResponse::from)
                .toList();
    }

    @Operation(summary = "Get a nutrition log of a user by date")
    @GetMapping("/by-date")
    public NutritionLogResponse getNutritionLogByDate(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Log date")  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate logDate
    ) {
        return NutritionLogResponse.from(
                nutritionLogService.getNutritionLogByUserAndDate(userId, logDate)
        );
    }
}
