package com.expensezen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, String>> checkHealth() {

        Map<String, String> response = Map.of(
                "status", "UP",
                "application", "ExpenseZen",
                "message", "ExpenseZen backend is running successfully"
        );

        return ResponseEntity.ok(response);
    }
}