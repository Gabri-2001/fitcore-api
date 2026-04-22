package com.gabri.fitcoreapi.user.dto;

import java.math.BigDecimal;

public class CreateUserRequest {

    private String name;
    private String email;
    private Integer age;
    private BigDecimal heightCm;
    private BigDecimal weightKg;

    public CreateUserRequest() {
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Integer getAge() {
        return age;
    }

    public BigDecimal getHeightCm() {
        return heightCm;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }
}