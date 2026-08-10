package com.expensezen.controller;

import com.expensezen.dto.request.GoalContributionRequest;
import com.expensezen.dto.request.SavingsGoalRequest;
import com.expensezen.dto.response.SavingsGoalResponse;
import com.expensezen.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @PostMapping
    public ResponseEntity<SavingsGoalResponse> create(
            @Valid @RequestBody SavingsGoalRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savingsGoalService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> getAll() {
        return ResponseEntity.ok(savingsGoalService.getAll());
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<SavingsGoalResponse> getById(
            @PathVariable Long goalId
    ) {
        return ResponseEntity.ok(
                savingsGoalService.getById(goalId)
        );
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<SavingsGoalResponse> update(
            @PathVariable Long goalId,
            @Valid @RequestBody SavingsGoalRequest request
    ) {
        return ResponseEntity.ok(
                savingsGoalService.update(goalId, request)
        );
    }

    @PatchMapping("/{goalId}/contributions")
    public ResponseEntity<SavingsGoalResponse> contribute(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalContributionRequest request
    ) {
        return ResponseEntity.ok(
                savingsGoalService.contribute(goalId, request)
        );
    }

    @PatchMapping("/{goalId}/cancel")
    public ResponseEntity<SavingsGoalResponse> cancel(
            @PathVariable Long goalId
    ) {
        return ResponseEntity.ok(
                savingsGoalService.cancel(goalId)
        );
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long goalId
    ) {
        savingsGoalService.delete(goalId);
        return ResponseEntity.noContent().build();
    }
}