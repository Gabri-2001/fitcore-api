package com.gabri.fitcoreapi.nutrition.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "diet_plans")
public class DietPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "plan_group_id", nullable = false, updatable = false)
    private UUID planGroupId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_plan_id")
    private DietPlan previousPlan;

    @OneToMany(mappedBy = "dietPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DietDay> dietDays = new ArrayList<>();

    protected DietPlan() {
    }

    public DietPlan(
            UUID planGroupId,
            String name,
            String description,
            Integer version,
            boolean active,
            LocalDate startDate,
            LocalDate endDate
    ) {
        this.planGroupId = planGroupId;
        this.name = name;
        this.description = description;
        this.version = version;
        this.active = active;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPreviousPlan(DietPlan previousPlan) {
        this.previousPlan = previousPlan;
    }

    public void addDietDay(DietDay dietDay) {
        dietDays.add(dietDay);
        dietDay.setDietPlan(this);
    }

    public User getUser() {
        return user;
    }

    public UUID getPlanGroupId() {
        return planGroupId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getVersion() {
        return version;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public DietPlan getPreviousPlan() {
        return previousPlan;
    }

    public List<DietDay> getDietDays() {
        return dietDays;
    }

    public void deactivate(LocalDate endDate) {
        this.active = false;
        this.endDate = endDate;
    }
}