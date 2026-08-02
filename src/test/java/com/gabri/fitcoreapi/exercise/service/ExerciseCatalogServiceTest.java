package com.gabri.fitcoreapi.exercise.service;

import com.gabri.fitcoreapi.exercise.domain.Equipment;
import com.gabri.fitcoreapi.exercise.repository.ExerciseMuscleActivationRepository;
import com.gabri.fitcoreapi.exercise.repository.ExerciseRepository;
import com.gabri.fitcoreapi.exercise.repository.ExerciseVariantRepository;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExerciseCatalogServiceTest {

    @Mock ExerciseRepository exercises;
    @Mock ExerciseVariantRepository variants;
    @Mock ExerciseMuscleActivationRepository activations;
    @InjectMocks ExerciseCatalogService service;

    @Test
    void capsSearchPageSizeAndAcceptsEquipmentAndMuscleFilters() {
        when(variants.findAll(any(Specification.class), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(List.of(), invocation.getArgument(1), 0));

        var result = service.searchVariants(
                "press", Set.of(Equipment.DUMBBELL), Set.of("pectoralis_major"),
                Set.of(MuscleGroup.CHEST), false, -3, 500);

        assertEquals(0, result.getNumber());
        assertEquals(100, result.getSize());
    }
}
