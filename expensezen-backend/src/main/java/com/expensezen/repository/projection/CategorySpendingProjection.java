package com.expensezen.repository.projection;

import java.math.BigDecimal;

public interface CategorySpendingProjection {

    Long getCategoryId();

    String getCategoryName();

    String getCategoryColor();

    String getCategoryIcon();

    BigDecimal getTotalAmount();
}