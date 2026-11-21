package com.gabri.fitcoreapi.progress.service;

import com.gabri.fitcoreapi.progress.dto.ExerciseProgressResponse;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.repository.ExerciseSetLogRepository;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Answers.RETURNS_DEEP_STUBS;

class ExerciseProgressServiceTest {
    @Test void keepsBodyweightIsometricsAndAssistanceSeparateFromExternalVolume() {
        var repository=mock(ExerciseSetLogRepository.class);
        var timed=log("plankBodyweight", "plank", "2026-11-01");
        when(timed.getDurationSeconds()).thenReturn(75);
        when(timed.getReps()).thenReturn((Integer) null);
        when(timed.getLoadMode()).thenReturn("BODYWEIGHT");
        var weighted=log("pullUpPronated", "pullUp", "2026-11-02");
        when(weighted.getReps()).thenReturn(6);
        when(weighted.getLoadMode()).thenReturn("WEIGHTED");
        when(weighted.getAddedWeightKg()).thenReturn(new BigDecimal("10"));
        var assisted=log("pullUpPronated", "pullUp", "2026-11-04");
        when(assisted.getReps()).thenReturn(10);
        when(assisted.getLoadMode()).thenReturn("ASSISTED");
        when(assisted.getAssistanceWeightKg()).thenReturn(new BigDecimal("15"));
        when(repository.findCompletedForProgress(7L))
                .thenReturn(List.of(timed,weighted,assisted));
        var service=new ExerciseProgressService(repository);
        ExerciseProgressResponse plank=service.byExercise(7L,"plank");
        assertEquals(75,plank.maximumDurationSeconds());
        assertEquals(1,plank.timedSets());
        assertEquals(0,plank.repetitionSets());
        assertEquals(0,plank.totalVolume().compareTo(BigDecimal.ZERO));
        ExerciseProgressResponse pull=service.byVariant(7L,"pullUpPronated");
        assertEquals(2,pull.completedSets());
        assertEquals(10,pull.maximumReps());
        assertEquals(0,pull.maximumAddedWeightKg().compareTo(new BigDecimal("10")));
        assertEquals(0,pull.minimumAssistanceWeightKg().compareTo(new BigDecimal("15")));
        assertEquals("ASSISTED",pull.history().getLast().loadMode());
        assertEquals(0,pull.totalVolume().compareTo(BigDecimal.ZERO));
        verify(repository,atLeastOnce()).findCompletedForProgress(7L);
    }

    private ExerciseSetLog log(String variantCode,String exerciseCode,String date) {
        var log=mock(ExerciseSetLog.class,RETURNS_DEEP_STUBS);
        when(log.getWorkoutSessionExercise().getExerciseVariant().getCode()).thenReturn(variantCode);
        lenient().when(log.getWorkoutSessionExercise().getExerciseVariant().getExercise().getCode()).thenReturn(exerciseCode);
        when(log.getWorkoutSessionExercise().getWorkoutSession().getSessionDate())
                .thenReturn(LocalDate.parse(date));
        lenient().when(log.estimatedOneRepMax()).thenReturn(BigDecimal.ZERO);
        return log;
    }
}
