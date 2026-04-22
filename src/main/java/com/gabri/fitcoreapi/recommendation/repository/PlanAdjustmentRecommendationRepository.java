package com.gabri.fitcoreapi.recommendation.repository;

import com.gabri.fitcoreapi.recommendation.domain.PlanAdjustmentRecommendation;
import com.gabri.fitcoreapi.recommendation.domain.RecommendationStatus;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanAdjustmentRecommendationRepository extends JpaRepository<PlanAdjustmentRecommendation, Long> {

    List<PlanAdjustmentRecommendation> findByUserOrderByRecommendationDateDesc(User user);

    List<PlanAdjustmentRecommendation> findByUserAndStatusOrderByRecommendationDateDesc(
            User user,
            RecommendationStatus status
    );
}