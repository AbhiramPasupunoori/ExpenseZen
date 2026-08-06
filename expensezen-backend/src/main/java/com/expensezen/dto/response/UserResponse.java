package com.expensezen.dto.response;

import com.expensezen.entity.User;
import com.expensezen.enums.Role;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String currency,
        Role role
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCurrency(),
                user.getRole()
        );
    }
}