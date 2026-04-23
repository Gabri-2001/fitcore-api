package com.gabri.fitcoreapi.user.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class CreateUserRequest {

    @NotBlank(message = "{validation.user.name.required}")
    private String name;

    @NotBlank(message = "{validation.user.email.required}")
    @Email(message = "{validation.user.email.invalid}")
    private String email;

    @Min(value = 0, message = "{validation.user.age.min}")
    private Integer age;

    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.user.height.positive}")
    private BigDecimal heightCm;

    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.user.weight.positive}")
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