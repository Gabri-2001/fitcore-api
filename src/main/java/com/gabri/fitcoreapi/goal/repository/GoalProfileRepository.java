package com.gabri.fitcoreapi.goal.repository;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalProfileRepository extends JpaRepository<GoalProfile, Long> {

    Optional<GoalProfile> findByUserAndActiveTrue(User user);

    List<GoalProfile> findByUserOrderByStartDateDesc(User user);
}