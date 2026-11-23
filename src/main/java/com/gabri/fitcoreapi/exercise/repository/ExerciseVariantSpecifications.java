package com.gabri.fitcoreapi.exercise.repository;

import com.gabri.fitcoreapi.exercise.domain.Equipment;
import com.gabri.fitcoreapi.exercise.domain.ExerciseMuscleActivation;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.muscle.domain.MuscleRole;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

public final class ExerciseVariantSpecifications {

    private ExerciseVariantSpecifications() {
    }

    public static Specification<ExerciseVariant> searchable(
            String text,
            Set<Equipment> equipment,
            Set<String> muscleCodes,
            Set<MuscleGroup> muscleGroups,
            boolean includeStabilizers
    ) {
        return (root, query, criteriaBuilder) -> {
            var predicates = new ArrayList<Predicate>();
            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            if (text != null && !text.isBlank()) {
                String pattern = "%" + text.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.join("exercise").get("name")), pattern)
                ));
            }

            if (equipment != null && !equipment.isEmpty()) {
                // "Sin equipamiento" = no material deportivo. Pared es válida,
                // pero barra, paralelas, banco y anclajes no lo son.
                var requested = new java.util.HashSet<>(equipment);
                boolean noEquipment = requested.remove(Equipment.NONE);
                var options = new java.util.ArrayList<Predicate>();
                if (!requested.isEmpty()) {
                    options.add(root.get("equipment").in(requested));
                }
                if (noEquipment) {
                    options.add(criteriaBuilder.and(
                            root.get("equipment").in(Equipment.BODYWEIGHT, Equipment.NONE),
                            root.get("requiredFacility").in(
                                    com.gabri.fitcoreapi.exercise.domain.RequiredFacility.NONE,
                                    com.gabri.fitcoreapi.exercise.domain.RequiredFacility.WALL)
                    ));
                }
                predicates.add(criteriaBuilder.or(options.toArray(Predicate[]::new)));
            }

            boolean filterMuscles = (muscleCodes != null && !muscleCodes.isEmpty())
                    || (muscleGroups != null && !muscleGroups.isEmpty());
            if (filterMuscles) {
                Subquery<Long> activationQuery = query.subquery(Long.class);
                Root<ExerciseMuscleActivation> activation = activationQuery.from(ExerciseMuscleActivation.class);
                var activationPredicates = new ArrayList<Predicate>();
                activationPredicates.add(criteriaBuilder.equal(activation.get("exerciseVariant").get("id"), root.get("id")));

                if (muscleCodes != null && !muscleCodes.isEmpty()) {
                    activationPredicates.add(activation.get("muscle").get("code").in(muscleCodes));
                }
                if (muscleGroups != null && !muscleGroups.isEmpty()) {
                    activationPredicates.add(activation.get("muscle").get("muscleGroup").in(muscleGroups));
                }
                if (!includeStabilizers) {
                    activationPredicates.add(criteriaBuilder.notEqual(activation.get("role"), MuscleRole.STABILIZER));
                }

                activationQuery.select(activation.get("exerciseVariant").get("id"))
                        .where(activationPredicates.toArray(Predicate[]::new));
                predicates.add(criteriaBuilder.exists(activationQuery));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
