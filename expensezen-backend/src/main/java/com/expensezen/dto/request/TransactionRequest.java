package com.expensezen.dto.request;

import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(

        @NotBlank(message = "Transaction title is required")
        @Size(max = 100,
                message = "Title cannot exceed 100 characters")
        String title,

        @NotNull(message = "Amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Amount must be greater than zero"
        )
        @Digits(
                integer = 13,
                fraction = 2,
                message = "Amount can contain a maximum of two decimal places"
        )
        BigDecimal amount,

        @NotNull(message = "Transaction date is required")
        LocalDate transactionDate,

        @Size(max = 500,
                message = "Description cannot exceed 500 characters")
        String description,

        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @NotNull(message = "Category ID is required")
        @Positive(message = "Category ID must be positive")
        Long categoryId
) {
}