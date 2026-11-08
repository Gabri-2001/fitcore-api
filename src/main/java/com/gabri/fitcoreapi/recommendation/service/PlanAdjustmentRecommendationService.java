package com.gabri.fitcoreapi.recommendation.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.repository.GoalProfileRepository;
import com.gabri.fitcoreapi.progress.domain.GoalProgressStatus;
import com.gabri.fitcoreapi.progress.dto.GoalProgressAssessmentResponse;
import com.gabri.fitcoreapi.progress.service.TrainingStatisticsService;
import com.gabri.fitcoreapi.recommendation.domain.PlanAdjustmentRecommendation;
import com.gabri.fitcoreapi.recommendation.domain.RecommendationStatus;
import com.gabri.fitcoreapi.recommendation.domain.RecommendationType;
import com.gabri.fitcoreapi.recommendation.repository.PlanAdjustmentRecommendationRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PlanAdjustmentRecommendationService {
    private static final BigDecimal LOW_ADHERENCE = new BigDecimal("50");

    private final UserRepository users;
    private final GoalProfileRepository goals;
    private final WorkoutPlanRepository plans;
    private final PlanAdjustmentRecommendationRepository recommendations;
    private final TrainingStatisticsService statistics;

    public PlanAdjustmentRecommendationService(UserRepository users, GoalProfileRepository goals,
            WorkoutPlanRepository plans, PlanAdjustmentRecommendationRepository recommendations,
            TrainingStatisticsService statistics) {
        this.users = users;
        this.goals = goals;
        this.plans = plans;
        this.recommendations = recommendations;
        this.statistics = statistics;
    }

    public PlanAdjustmentRecommendation generate(Long userId, LocalDate evaluationDate) {
        User user = ownedUser(userId);
        LocalDate date = evaluationDate == null ? LocalDate.now() : evaluationDate;
        GoalProfile goal = goals.findByUserAndActiveTrue(user)
                .orElseThrow(() -> new BusinessRuleException("An active goal is required to generate a recommendation"));
        WorkoutPlan plan = plans.findByUserAndActiveTrue(user).orElse(null);
        GoalProgressAssessmentResponse assessment = statistics
                .getStatistics(userId, date.minusDays(27), date).goalProgress();
        if (assessment.status() == GoalProgressStatus.INSUFFICIENT_DATA) {
            throw new BusinessRuleException("There is not enough training and progress data for a recommendation");
        }

        RecommendationType type;
        String reason;
        Integer setsChange = null;
        Integer repsChange = null;
        BigDecimal adherence = assessment.trainingAdherencePercent();
        if (adherence != null && adherence.compareTo(LOW_ADHERENCE) < 0) {
            type = RecommendationType.RECOVERY_ADJUSTMENT;
            reason = "Training adherence is below 50%; review schedule feasibility and recovery before adding volume.";
            setsChange = -1;
        } else if (assessment.status() == GoalProgressStatus.NEEDS_ATTENTION) {
            type = RecommendationType.TRAINING_VOLUME_ADJUSTMENT;
            reason = "Training adherence is acceptable but the measured outcome is not moving toward the active goal.";
            setsChange = 1;
        } else {
            type = RecommendationType.TRAINING_VOLUME_ADJUSTMENT;
            reason = "Current training is aligned with the active goal; maintain volume and progress repetitions gradually.";
            repsChange = 1;
        }

        PlanAdjustmentRecommendation recommendation = new PlanAdjustmentRecommendation(
                date, type, reason, null, null, setsChange, repsChange, RecommendationStatus.PENDING);
        recommendation.setUser(user);
        recommendation.setGoalProfile(goal);
        recommendation.setWorkoutPlan(plan);
        return recommendations.save(recommendation);
    }

    @Transactional(readOnly = true)
    public List<PlanAdjustmentRecommendation> findAll(Long userId, RecommendationStatus status) {
        User user = ownedUser(userId);
        return status == null ? recommendations.findByUserOrderByRecommendationDateDesc(user)
                : recommendations.findByUserAndStatusOrderByRecommendationDateDesc(user, status);
    }

    public PlanAdjustmentRecommendation accept(Long userId, Long recommendationId) {
        PlanAdjustmentRecommendation value = ownedRecommendation(userId, recommendationId);
        transition(value, true);
        return value;
    }

    public PlanAdjustmentRecommendation reject(Long userId, Long recommendationId) {
        PlanAdjustmentRecommendation value = ownedRecommendation(userId, recommendationId);
        transition(value, false);
        return value;
    }

    private void transition(PlanAdjustmentRecommendation value, boolean accept) {
        try {
            if (accept) value.accept(); else value.reject();
        } catch (IllegalStateException exception) {
            throw new BusinessRuleException(exception.getMessage());
        }
    }

    private PlanAdjustmentRecommendation ownedRecommendation(Long userId, Long id) {
        return recommendations.findByIdAndUser(id, ownedUser(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found with id: " + id));
    }

    private User ownedUser(Long userId) {
        return users.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
