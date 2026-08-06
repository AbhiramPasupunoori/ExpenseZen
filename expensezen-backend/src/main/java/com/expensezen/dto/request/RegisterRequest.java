package com.expensezen.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100,
                message = "Full name must contain between 2 and 100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 64,
                message = "Password must contain between 8 and 64 characters")
        String password,

        @Pattern(
                regexp = "(?i)^[A-Z]{3}$",
                message = "Currency must be a three-letter code such as INR"
        )
        String currency
) {
}