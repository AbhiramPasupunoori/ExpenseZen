package com.expensezen.dto.response;

import com.expensezen.entity.Category;
import com.expensezen.enums.TransactionType;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String name,
        TransactionType type,
        String color,
        String icon,
        boolean defaultCategory,
        LocalDateTime createdAt
) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getColor(),
                category.getIcon(),
                category.isDefaultCategory(),
                category.getCreatedAt()
        );
    }
}