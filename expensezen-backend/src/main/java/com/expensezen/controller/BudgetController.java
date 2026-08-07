package com.expensezen.controller;

import com.expensezen.dto.request.BudgetRequest;
import com.expensezen.dto.response.BudgetResponse;
import com.expensezen.dto.response.BudgetSummaryResponse;
import com.expensezen.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        BudgetResponse response = budgetService.create(
                authentication.getName(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAll(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                budgetService.getAll(
                        authentication.getName(),
                        month,
                        year
                )
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryResponse> getSummary(
            @RequestParam Integer month,
            @RequestParam Integer year,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                budgetService.getSummary(
                        authentication.getName(),
                        month,
                        year
                )
        );
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> getById(
            @PathVariable Long budgetId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                budgetService.getById(
                        authentication.getName(),
                        budgetId
                )
        );
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> update(
            @PathVariable Long budgetId,
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                budgetService.update(
                        authentication.getName(),
                        budgetId,
                        request
                )
        );
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long budgetId,
            Authentication authentication
    ) {
        budgetService.delete(
                authentication.getName(),
                budgetId
        );

        return ResponseEntity.noContent().build();
    }
}