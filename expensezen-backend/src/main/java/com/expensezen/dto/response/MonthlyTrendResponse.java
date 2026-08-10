package com.expensezen.dto.response;

import java.math.BigDecimal;

public record MonthlyTrendResponse(
        Integer year,
        Integer month,
        String label,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal balance
) {
}