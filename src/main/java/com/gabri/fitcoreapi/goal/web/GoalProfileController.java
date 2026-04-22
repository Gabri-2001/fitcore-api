package com.gabri.fitcoreapi.goal.web;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.dto.CreateGoalProfileRequest;
import com.gabri.fitcoreapi.goal.dto.GoalProfileResponse;
import com.gabri.fitcoreapi.goal.service.GoalProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/goal-profiles")
public class GoalProfileController {

    private final GoalProfileService goalProfileService;

    public GoalProfileController(GoalProfileService goalProfileService) {
        this.goalProfileService = goalProfileService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalProfileResponse createGoalProfile(
            @PathVariable Long userId,
            @RequestBody CreateGoalProfileRequest request
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

        return GoalProfileResponse.from(goalProfile);
    }

    @GetMapping("/active")
    public GoalProfileResponse getActiveGoalProfile(@PathVariable Long userId) {
        return GoalProfileResponse.from(goalProfileService.getActiveGoalProfile(userId));
    }

    @GetMapping
    public List<GoalProfileResponse> getGoalProfileHistory(@PathVariable Long userId) {
        return goalProfileService.getGoalProfileHistory(userId)
                .stream()
                .map(GoalProfileResponse::from)
                .toList();
    }
}
