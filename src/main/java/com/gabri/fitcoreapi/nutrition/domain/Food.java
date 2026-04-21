package com.gabri.fitcoreapi.nutrition.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "foods")
public class Food extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 120)
    private String brand;

    @Column(name = "base_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal baseQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "base_unit", nullable = false, length = 30)
    private FoodUnit baseUnit;

    @Column(name = "calories_per_base", nullable = false, precision = 8, scale = 2)
    private BigDecimal caloriesPerBase;

    @Column(name = "protein_per_base", nullable = false, precision = 8, scale = 2)
    private BigDecimal proteinPerBase;

    @Column(name = "carbs_per_base", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbsPerBase;

    @Column(name = "fats_per_base", nullable = false, precision = 8, scale = 2)
    private BigDecimal fatsPerBase;

    @Column(name = "fiber_per_base", precision = 8, scale = 2)
    private BigDecimal fiberPerBase;

    protected Food() {
    }

    public Food(
            String name,
            String brand,
            BigDecimal baseQuantity,
            FoodUnit baseUnit,
            BigDecimal caloriesPerBase,
            BigDecimal proteinPerBase,
            BigDecimal carbsPerBase,
            BigDecimal fatsPerBase,
            BigDecimal fiberPerBase
    ) {
        this.name = name;
        this.brand = brand;
        this.baseQuantity = baseQuantity;
        this.baseUnit = baseUnit;
        this.caloriesPerBase = caloriesPerBase;
        this.proteinPerBase = proteinPerBase;
        this.carbsPerBase = carbsPerBase;
        this.fatsPerBase = fatsPerBase;
        this.fiberPerBase = fiberPerBase;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public BigDecimal getBaseQuantity() {
        return baseQuantity;
    }

    public FoodUnit getBaseUnit() {
        return baseUnit;
    }

    public BigDecimal getCaloriesPerBase() {
        return caloriesPerBase;
    }

    public BigDecimal getProteinPerBase() {
        return proteinPerBase;
    }

    public BigDecimal getCarbsPerBase() {
        return carbsPerBase;
    }

    public BigDecimal getFatsPerBase() {
        return fatsPerBase;
    }

    public BigDecimal getFiberPerBase() {
        return fiberPerBase;
    }
}
