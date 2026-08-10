package com.expensezen.dto.response;

import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.RecurrenceFrequency;
import com.expensezen.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringTransactionResponse(
        Long id,
        String title,
        BigDecimal amount,
        String description,
        TransactionType type,
        PaymentMethod paymentMethod,
        RecurrenceFrequency frequency,
        LocalDate startDate,
        LocalDate nextRunDate,
        LocalDate endDate,
        boolean active,
        Long categoryId,
        String categoryName
) {
}