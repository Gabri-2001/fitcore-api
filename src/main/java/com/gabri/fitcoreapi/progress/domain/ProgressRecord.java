package com.gabri.fitcoreapi.progress.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "progress_records")
public class ProgressRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "body_fat_percentage", precision = 5, scale = 2)
    private BigDecimal bodyFatPercentage;

    @Column(name = "muscle_mass_kg", precision = 5, scale = 2)
    private BigDecimal muscleMassKg;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(length = 1500)
    private String notes;

    protected ProgressRecord() {
    }

    public ProgressRecord(
            BigDecimal weightKg,
            BigDecimal bodyFatPercentage,
            BigDecimal muscleMassKg,
            LocalDate recordDate,
            String notes
    ) {
        this.weightKg = weightKg;
        this.bodyFatPercentage = bodyFatPercentage;
        this.muscleMassKg = muscleMassKg;
        this.recordDate = recordDate;
        this.notes = notes;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public BigDecimal getBodyFatPercentage() {
        return bodyFatPercentage;
    }

    public BigDecimal getMuscleMassKg() {
        return muscleMassKg;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public String getNotes() {
        return notes;
    }
}