package com.gabri.fitcoreapi.progress.dto;

import com.gabri.fitcoreapi.progress.domain.GoalSignalStatus;

import java.math.BigDecimal;

public record GoalSignalResponse(
        String code,
        GoalSignalStatus status,
        BigDecimal value
) {
}
