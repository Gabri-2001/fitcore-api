package com.gabri.fitcoreapi.progress.dto;

import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import java.math.BigDecimal;

public record MuscleGroupProgressResponse(MuscleGroup muscleGroup, long completedSets, BigDecimal totalVolume) {}
