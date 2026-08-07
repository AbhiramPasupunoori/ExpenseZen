package com.expensezen.service;

import com.expensezen.dto.request.LoginRequest;
import com.expensezen.dto.request.RegisterRequest;
import com.expensezen.dto.response.AuthResponse;
import com.expensezen.dto.response.UserResponse;
import com.expensezen.entity.User;
import com.expensezen.enums.Role;
import com.expensezen.exception.DuplicateResourceException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.UserRepository;
import com.expensezen.security.JwtTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final DefaultCategoryService defaultCategoryService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService,
            DefaultCategoryService defaultCategoryService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.defaultCategoryService = defaultCategoryService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException(
                    "An account with this email already exists"
            );
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.password())
        );
        user.setCurrency(normalizeCurrency(request.currency()));
        user.setRole(Role.USER);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        defaultCategoryService.createDefaultCategories(savedUser);

        return createAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User account was not found"
                        )
                );

        return createAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User account was not found"
                        )
                );

        return UserResponse.from(user);
    }

    private AuthResponse createAuthResponse(User user) {
        Jwt jwt = jwtTokenService.generateToken(user);

        return new AuthResponse(
                jwt.getTokenValue(),
                "Bearer",
                jwtTokenService.getExpirationSeconds(),
                jwt.getExpiresAt(),
                UserResponse.from(user)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "INR";
        }

        return currency.trim().toUpperCase(Locale.ROOT);
    }
}
