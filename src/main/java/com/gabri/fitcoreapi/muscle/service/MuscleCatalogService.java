package com.gabri.fitcoreapi.muscle.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.muscle.domain.Muscle;
import com.gabri.fitcoreapi.muscle.repository.MuscleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class MuscleCatalogService {
    private final MuscleRepository muscles;
    public MuscleCatalogService(MuscleRepository muscles) { this.muscles = muscles; }
    public List<Muscle> findAll() { return muscles.findByActiveTrueOrderByNameAsc(); }
    public Muscle findByCode(String code) { return muscles.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new ResourceNotFoundException("Muscle not found with code: " + code)); }
}
