package com.expensezen.dto.response;

import com.expensezen.repository.projection.CategorySpendingProjection;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record CategoryBreakdownResponse(
        Long categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        BigDecimal amount,
        BigDecimal percentage
) {

    public static CategoryBreakdownResponse from(
            CategorySpendingProjection projection,
            BigDecimal totalExpenses
    ) {
        BigDecimal amount = projection.getTotalAmount() == null
                ? BigDecimal.ZERO
                : projection.getTotalAmount();

        BigDecimal percentage =
                totalExpenses.compareTo(BigDecimal.ZERO) == 0
                        ? BigDecimal.ZERO
                        : amount
                        .multiply(new BigDecimal("100"))
                        .divide(
                                totalExpenses,
                                2,
                                RoundingMode.HALF_UP
                        );

        return new CategoryBreakdownResponse(
                projection.getCategoryId(),
                projection.getCategoryName(),
                projection.getCategoryColor(),
                projection.getCategoryIcon(),
                amount,
                percentage
        );
    }
}