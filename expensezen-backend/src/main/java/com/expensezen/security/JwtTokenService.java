package com.expensezen.security;

import com.expensezen.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class JwtTokenService {

    private final JwtEncoder jwtEncoder;
    private final long expirationMinutes;
    private final String issuer;

    public JwtTokenService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
            @Value("${app.jwt.issuer}") String issuer
    ) {
        this.jwtEncoder = jwtEncoder;
        this.expirationMinutes = expirationMinutes;
        this.issuer = issuer;
    }

    public Jwt generateToken(User user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(
                Duration.ofMinutes(expirationMinutes)
        );

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim(
                        "roles",
                        List.of("ROLE_" + user.getRole().name())
                )
                .build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(claims)
        );
    }

    public long getExpirationSeconds() {
        return Duration.ofMinutes(expirationMinutes).toSeconds();
    }
}