package com.gabri.fitcoreapi.progress.dto;

import java.math.BigDecimal;
import java.util.Map;

public record ProgressOverviewResponse(long completedSets, BigDecimal totalVolume,
        BigDecimal bestEstimatedOneRepMax, Map<String, BigDecimal> weeklyVolume) {}
