package com.expensezen.dto.response;

import com.expensezen.enums.BudgetStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public record BudgetSummaryResponse(
        Integer month,
        Integer year,
        BigDecimal totalBudget,
        BigDecimal totalSpent,
        BigDecimal totalRemaining,
        BigDecimal usagePercentage,
        BudgetStatus overallStatus,
        int budgetCount,
        long warningCount,
        long exceededCount,
        List<BudgetResponse> budgets
) {

    public static BudgetSummaryResponse from(
            Integer month,
            Integer year,
            List<BudgetResponse> budgets
    ) {
        BigDecimal totalBudget = budgets.stream()
                .map(BudgetResponse::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = budgets.stream()
                .map(BudgetResponse::spentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRemaining =
                totalBudget.subtract(totalSpent);

        BigDecimal usagePercentage =
                totalBudget.compareTo(BigDecimal.ZERO) == 0
                        ? BigDecimal.ZERO
                        : totalSpent
                        .multiply(new BigDecimal("100"))
                        .divide(
                                totalBudget,
                                2,
                                RoundingMode.HALF_UP
                        );

        long warningCount = budgets.stream()
                .filter(budget ->
                        budget.status()
                                == BudgetStatus.WARNING
                )
                .count();

        long exceededCount = budgets.stream()
                .filter(budget ->
                        budget.status()
                                == BudgetStatus.EXCEEDED
                )
                .count();

        BudgetStatus overallStatus;

        if (exceededCount > 0) {
            overallStatus = BudgetStatus.EXCEEDED;
        } else if (warningCount > 0) {
            overallStatus = BudgetStatus.WARNING;
        } else {
            overallStatus = BudgetStatus.SAFE;
        }

        return new BudgetSummaryResponse(
                month,
                year,
                totalBudget,
                totalSpent,
                totalRemaining,
                usagePercentage,
                overallStatus,
                budgets.size(),
                warningCount,
                exceededCount,
                budgets
        );
    }
}