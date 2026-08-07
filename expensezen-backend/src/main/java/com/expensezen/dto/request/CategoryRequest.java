package com.expensezen.dto.request;

import com.expensezen.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Category name is required")
        @Size(max = 50,
                message = "Category name cannot exceed 50 characters")
        String name,

        @NotNull(message = "Category type is required")
        TransactionType type,

        @Pattern(
                regexp = "^#[0-9A-Fa-f]{6}$",
                message = "Color must use a valid hex code such as #3B82F6"
        )
        String color,

        @Size(max = 50,
                message = "Icon name cannot exceed 50 characters")
        String icon
) {
}