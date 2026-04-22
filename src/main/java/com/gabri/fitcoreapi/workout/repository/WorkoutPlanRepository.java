package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    Optional<WorkoutPlan> findByUserAndActiveTrue(User user);

    List<WorkoutPlan> findByUserOrderByStartDateDesc(User user);

    List<WorkoutPlan> findByPlanGroupIdOrderByVersionDesc(UUID planGroupId);
}