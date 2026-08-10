package com.expensezen.controller;

import com.expensezen.dto.response.DashboardResponse;
import com.expensezen.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam(defaultValue = "6")
            Integer trendMonths,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                dashboardService.getDashboard(
                        authentication.getName(),
                        month,
                        year,
                        trendMonths
                )
        );
    }
}