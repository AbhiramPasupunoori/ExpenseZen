package com.expensezen.repository.projection;

import java.math.BigDecimal;

public interface MonthlyTrendProjection {

    Integer getTrendYear();

    Integer getTrendMonth();

    BigDecimal getIncomeAmount();

    BigDecimal getExpenseAmount();
}