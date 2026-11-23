package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.exercise.domain.Exercise;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.repository.ExerciseSetLogRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionExerciseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExerciseSetLogServiceTest {
    @Mock WorkoutSessionExerciseRepository exercises;
    @Mock ExerciseSetLogRepository logs;
    @InjectMocks ExerciseSetLogService service;

    @Test
    void validatesTimeAndWeightedSetsBeforePersisting() {
        var exercise=fixture("SECONDS",true);
        assertThrows(BusinessRuleException.class, () ->
                service.createWithMetrics(7L,40L,1,null,null,null,null,true,
                        null,null,null,null,null,"BODYWEIGHT"));
        assertThrows(BusinessRuleException.class, () ->
                service.createWithMetrics(7L,40L,1,null,10,null,null,true,
                        null,45,null,null,null,"BODYWEIGHT"));
        assertThrows(BusinessRuleException.class, () ->
                service.createWithMetrics(7L,40L,1,null,null,null,null,true,
                        null,45,null,BigDecimal.ZERO,null,"WEIGHTED"));
        verifyNoInteractions(logs);
        verify(exercise,never()).addSetLog(any());
    }

    @Test
    void persistsPositiveAddedWeightWithDurationAndNoReps() {
        var exercise=fixture("SECONDS",true);
        when(logs.saveAndFlush(any(ExerciseSetLog.class)))
                .thenAnswer(call->call.getArgument(0));
        var result=service.createWithMetrics(7L,40L,1,null,null,null,null,true,
                null,60,null,new BigDecimal("5"),null,"WEIGHTED");
        assertEquals("WEIGHTED",result.getLoadMode());
        assertEquals(60,result.getDurationSeconds());
        assertEquals(0,result.getAddedWeightKg().compareTo(new BigDecimal("5")));
        assertNull(result.getReps());
        verify(exercise).addSetLog(result);
        verify(exercise).synchronizeSetSummary();
    }

    @Test
    void rejectsAssistanceWhenExerciseDoesNotAllowIt() {
        fixture("REPETITIONS",false);
        assertThrows(BusinessRuleException.class, () ->
                service.createWithMetrics(7L,40L,1,null,10,null,null,true,
                        null,null,null,null,new BigDecimal("20"),"ASSISTED"));
        verifyNoInteractions(logs);
    }

    private WorkoutSessionExercise fixture(String unit, boolean allowsAdded) {
        var exercise=mock(WorkoutSessionExercise.class);
        var session=mock(WorkoutSession.class);
        var variant=mock(ExerciseVariant.class);
        var base=mock(Exercise.class);
        when(exercises.findByIdAndWorkoutSessionUserId(40L,7L)).thenReturn(Optional.of(exercise));
        when(exercise.getWorkoutSession()).thenReturn(session);
        when(session.isEditable()).thenReturn(true);
        when(exercise.getExerciseVariant()).thenReturn(variant);
        when(variant.getResistanceSource()).thenReturn("BODYWEIGHT");
        when(variant.getExercise()).thenReturn(base);
        when(base.getDefaultUnit()).thenReturn(unit);
        if(allowsAdded) when(variant.isAllowsAddedWeight()).thenReturn(true);
        return exercise;
    }
}
