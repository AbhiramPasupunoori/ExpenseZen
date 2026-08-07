package com.expensezen.dto.response;

import com.expensezen.entity.Transaction;
import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        String title,
        BigDecimal amount,
        LocalDate transactionDate,
        String description,
        TransactionType type,
        PaymentMethod paymentMethod,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static TransactionResponse from(
            Transaction transaction
    ) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getTitle(),
                transaction.getAmount(),
                transaction.getTransactionDate(),
                transaction.getDescription(),
                transaction.getType(),
                transaction.getPaymentMethod(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getCategory().getColor(),
                transaction.getCategory().getIcon(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}