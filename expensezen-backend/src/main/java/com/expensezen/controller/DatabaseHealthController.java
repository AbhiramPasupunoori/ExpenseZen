package com.expensezen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class DatabaseHealthController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> checkDatabase() {

        Integer result = jdbcTemplate.queryForObject(
                "SELECT 1",
                Integer.class
        );

        boolean connected = result != null && result == 1;

        Map<String, Object> response = Map.of(
                "status", connected ? "UP" : "DOWN",
                "database", "MySQL",
                "application", "ExpenseZen",
                "message", connected
                        ? "Database connection successful"
                        : "Database connection failed"
        );

        return ResponseEntity.ok(response);
    }
}