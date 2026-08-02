package com.gabri.fitcoreapi.progress.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.progress.domain.ProgressRecord;
import com.gabri.fitcoreapi.progress.dto.CreateProgressRecordRequest;
import com.gabri.fitcoreapi.progress.repository.ProgressRecordRepository;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ProgressRecordService {

    private final UserRepository users;
    private final ProgressRecordRepository records;

    public ProgressRecordService(UserRepository users, ProgressRecordRepository records) {
        this.users = users;
        this.records = records;
    }

    public ProgressRecord create(Long userId, CreateProgressRecordRequest request) {
        var user = users.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (records.findByUserIdAndRecordDate(userId, request.recordDate()).isPresent()) {
            throw new BusinessRuleException("A progress record already exists for date: " + request.recordDate());
        }
        if (request.weightKg() == null && request.bodyFatPercentage() == null && request.muscleMassKg() == null) {
            throw new BusinessRuleException("At least one body measurement is required");
        }
        ProgressRecord record = new ProgressRecord(
                request.weightKg(), request.bodyFatPercentage(), request.muscleMassKg(),
                request.recordDate(), request.notes());
        record.setUser(user);
        return records.save(record);
    }

    @Transactional(readOnly = true)
    public List<ProgressRecord> find(Long userId, LocalDate from, LocalDate to) {
        if (!users.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        LocalDate effectiveTo = to == null ? LocalDate.now() : to;
        LocalDate effectiveFrom = from == null ? effectiveTo.minusMonths(6) : from;
        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new BusinessRuleException("Progress record start date must not be after end date");
        }
        return records.findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(userId, effectiveFrom, effectiveTo);
    }
}
