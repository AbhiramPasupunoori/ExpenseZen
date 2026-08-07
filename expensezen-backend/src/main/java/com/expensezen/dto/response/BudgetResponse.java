package com.expensezen.dto.response;

import com.expensezen.entity.Budget;
import com.expensezen.enums.BudgetStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

public record BudgetResponse(
        Long id,
        BigDecimal amount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        BigDecimal usagePercentage,
        BudgetStatus status,
        Integer month,
        Integer year,
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    private static final BigDecimal WARNING_PERCENTAGE =
            new BigDecimal("80.00");

    public static BudgetResponse from(
            Budget budget,
            BigDecimal spentAmount
    ) {
        BigDecimal spent = spentAmount == null
                ? BigDecimal.ZERO
                : spentAmount;

        BigDecimal remaining =
                budget.getAmount().subtract(spent);

        BigDecimal percentage = spent
                .multiply(new BigDecimal("100"))
                .divide(
                        budget.getAmount(),
                        2,
                        RoundingMode.HALF_UP
                );

        BudgetStatus status;

        if (spent.compareTo(budget.getAmount()) >= 0) {
            status = BudgetStatus.EXCEEDED;
        } else if (percentage.compareTo(
                WARNING_PERCENTAGE
        ) >= 0) {
            status = BudgetStatus.WARNING;
        } else {
            status = BudgetStatus.SAFE;
        }

        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                spent,
                remaining,
                percentage,
                status,
                budget.getBudgetMonth(),
                budget.getBudgetYear(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getCategory().getColor(),
                budget.getCategory().getIcon(),
                budget.getCreatedAt(),
                budget.getUpdatedAt()
        );
    }
}