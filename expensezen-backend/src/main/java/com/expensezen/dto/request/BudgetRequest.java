package com.expensezen.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequest(

        @NotNull(message = "Budget amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Budget amount must be greater than zero"
        )
        @Digits(
                integer = 13,
                fraction = 2,
                message = "Amount can contain a maximum of two decimal places"
        )
        BigDecimal amount,

        @NotNull(message = "Budget month is required")
        @Min(value = 1, message = "Month must be between 1 and 12")
        @Max(value = 12, message = "Month must be between 1 and 12")
        Integer month,

        @NotNull(message = "Budget year is required")
        @Min(value = 2000, message = "Year must be 2000 or later")
        @Max(value = 2100, message = "Year cannot exceed 2100")
        Integer year,

        @NotNull(message = "Category ID is required")
        @Positive(message = "Category ID must be positive")
        Long categoryId
) {
}