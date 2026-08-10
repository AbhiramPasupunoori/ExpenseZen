package com.expensezen.controller;

import com.expensezen.dto.request.RecurringTransactionRequest;
import com.expensezen.dto.response.RecurringTransactionResponse;
import com.expensezen.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    public RecurringTransactionController(
            RecurringTransactionService recurringService
    ) {
        this.recurringService = recurringService;
    }

    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> create(
            @Valid @RequestBody RecurringTransactionRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(recurringService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getAll() {
        return ResponseEntity.ok(recurringService.getAll());
    }

    @PutMapping("/{recurringId}")
    public ResponseEntity<RecurringTransactionResponse> update(
            @PathVariable Long recurringId,
            @Valid @RequestBody RecurringTransactionRequest request
    ) {
        return ResponseEntity.ok(
                recurringService.update(recurringId, request)
        );
    }

    @PatchMapping("/{recurringId}/toggle")
    public ResponseEntity<RecurringTransactionResponse> toggle(
            @PathVariable Long recurringId
    ) {
        return ResponseEntity.ok(
                recurringService.toggle(recurringId)
        );
    }

    @PostMapping("/process-due")
    public ResponseEntity<Map<String, Integer>> processDue() {
        int generated = recurringService.processDueForCurrentUser();

        return ResponseEntity.ok(
                Map.of("generatedTransactions", generated)
        );
    }

    @DeleteMapping("/{recurringId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long recurringId
    ) {
        recurringService.delete(recurringId);
        return ResponseEntity.noContent().build();
    }
}