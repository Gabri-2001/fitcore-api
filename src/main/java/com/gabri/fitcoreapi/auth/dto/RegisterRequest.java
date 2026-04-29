package com.gabri.fitcoreapi.auth.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class RegisterRequest {

    @NotBlank(message = "{validation.auth.name.required}")
    private String name;

    @NotBlank(message = "{validation.auth.email.required}")
    @Email(message = "{validation.auth.email.invalid}")
    private String email;

    @NotBlank(message = "{validation.auth.password.required}")
    @Size(min = 8, message = "{validation.auth.password.size}")
    private String password;

    @Min(value = 0, message = "{validation.user.age.min}")
    private Integer age;

    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.user.height.positive}")
    private BigDecimal heightCm;

    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.user.weight.positive}")
    private BigDecimal weightKg;

    public RegisterRequest() {
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
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
