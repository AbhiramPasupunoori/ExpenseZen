package com.expensezen.dto.request;

import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.RecurrenceFrequency;
import com.expensezen.enums.TransactionType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringTransactionRequest(

        @NotBlank
        @Size(max = 100)
        String title,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal amount,

        @Size(max = 500)
        String description,

        @NotNull
        TransactionType type,

        @NotNull
        PaymentMethod paymentMethod,

        @NotNull
        RecurrenceFrequency frequency,

        @NotNull
        @FutureOrPresent
        LocalDate startDate,

        @FutureOrPresent
        LocalDate endDate,

        @NotNull
        Long categoryId
) {
}