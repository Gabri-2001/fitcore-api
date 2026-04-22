package com.gabri.fitcoreapi.user.dto;

import com.gabri.fitcoreapi.user.domain.User;

import java.math.BigDecimal;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Integer age;
    private BigDecimal heightCm;
    private BigDecimal weightKg;

    public UserResponse(Long id, String name, String email, Integer age, BigDecimal heightCm, BigDecimal weightKg) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
    }

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAge(),
                user.getHeightCm(),
                user.getWeightKg()
        );
    }

    public Long getId() {
        return id;
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