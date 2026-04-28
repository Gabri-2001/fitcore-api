package com.gabri.fitcoreapi.nutrition.repository;

import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DietPlanRepository extends JpaRepository<DietPlan, Long> {

    Optional<DietPlan> findByUserAndActiveTrue(User user);

    List<DietPlan> findByUserOrderByStartDateDesc(User user);

    List<DietPlan> findByPlanGroupIdOrderByVersionDesc(UUID planGroupId);

    Optional<DietPlan> findByIdAndUser(Long id, User user);
}