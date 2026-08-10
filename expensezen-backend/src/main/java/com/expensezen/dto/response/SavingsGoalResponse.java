package com.expensezen.dto.response;

import com.expensezen.enums.GoalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SavingsGoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal savedAmount,
        BigDecimal remainingAmount,
        BigDecimal progressPercentage,
        LocalDate targetDate,
        GoalStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}