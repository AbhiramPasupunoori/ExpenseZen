package com.expensezen.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @NotNull
        @DecimalMin(value = "1.00")
        BigDecimal targetAmount,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal initialAmount,

        @NotNull
        @FutureOrPresent
        LocalDate targetDate
) {
}