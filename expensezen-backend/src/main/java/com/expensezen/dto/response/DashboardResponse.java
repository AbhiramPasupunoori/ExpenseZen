package com.expensezen.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        Integer month,
        Integer year,
        String currency,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance,
        long transactionCount,
        List<CategoryBreakdownResponse> categoryBreakdown,
        List<MonthlyTrendResponse> monthlyTrends
) {
}