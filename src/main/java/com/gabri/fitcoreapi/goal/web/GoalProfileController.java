package com.gabri.fitcoreapi.goal.web;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.dto.CreateGoalProfileRequest;
import com.gabri.fitcoreapi.goal.dto.GoalProfileResponse;
import com.gabri.fitcoreapi.goal.service.GoalProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(name = "Goal Profiles", description = "Operations related to user goal profiles")
@RestController
@RequestMapping("/api/users/{userId}/goal-profiles")
public class GoalProfileController {

    private final GoalProfileService goalProfileService;

    public GoalProfileController(GoalProfileService goalProfileService) {
        this.goalProfileService = goalProfileService;
    }

    @Operation(summary = "Create a new goal profile for a user")
    @PostMapping
    public ResponseEntity<GoalProfileResponse> createGoalProfile(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Valid @RequestBody CreateGoalProfileRequest request
    ) {
        GoalProfile goalProfile = goalProfileService.createGoalProfile(
                userId,
                request.getGoalType(),
                request.getTargetCalories(),
                request.getTargetProtein(),
                request.getTargetCarbs(),
                request.getTargetFats(),
                request.getReviewFrequencyDays(),
                request.getStartDate()
        );

        URI location = URI.create("/api/users/" + userId + "/goal-profiles/" + goalProfile.getId());
        return ResponseEntity.created(location).body(GoalProfileResponse.from(goalProfile));
    }

    @Operation(summary = "Get the active goal profile of a user")
    @GetMapping("/active")
    public GoalProfileResponse getActiveGoalProfile(@Parameter(description = "User id") @PathVariable Long userId) {
        return GoalProfileResponse.from(goalProfileService.getActiveGoalProfile(userId));
    }

    @Operation(summary = "Get goal profile history of a user")
    @GetMapping
    public List<GoalProfileResponse> getGoalProfileHistory(@Parameter(description = "User id") @PathVariable Long userId) {
        return goalProfileService.getGoalProfileHistory(userId)
                .stream()
                .map(GoalProfileResponse::from)
                .toList();
    }
}
