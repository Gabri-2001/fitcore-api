package com.gabri.fitcoreapi.progress.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.progress.dto.CreateProgressRecordRequest;
import com.gabri.fitcoreapi.progress.repository.ProgressRecordRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressRecordServiceTest {

    @Mock UserRepository users;
    @Mock ProgressRecordRepository records;
    @InjectMocks ProgressRecordService service;

    @Test
    void createsOneBodyMeasurementPerUserAndDate() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);
        LocalDate date = LocalDate.of(2026, 8, 2);
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(records.findByUserIdAndRecordDate(1L, date)).thenReturn(Optional.empty());
        when(records.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var created = service.create(1L, new CreateProgressRecordRequest(
                new BigDecimal("78.40"), new BigDecimal("16.20"), null, date, null));

        assertEquals(new BigDecimal("78.40"), created.getWeightKg());
        assertEquals(user, created.getUser());
    }

    @Test
    void rejectsRecordWithoutAnyMeasurement() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);
        LocalDate date = LocalDate.of(2026, 8, 2);
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(records.findByUserIdAndRecordDate(1L, date)).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () -> service.create(1L,
                new CreateProgressRecordRequest(null, null, null, date, null)));
    }
}
