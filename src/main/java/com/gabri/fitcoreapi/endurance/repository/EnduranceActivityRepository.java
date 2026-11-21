package com.gabri.fitcoreapi.endurance.repository;

import com.gabri.fitcoreapi.endurance.domain.EnduranceActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnduranceActivityRepository extends JpaRepository<EnduranceActivity,Long> {
    List<EnduranceActivity> findByUserIdOrderByStartedAtDesc(Long userId);
    Optional<EnduranceActivity> findByIdAndUserId(Long id,Long userId);
}
