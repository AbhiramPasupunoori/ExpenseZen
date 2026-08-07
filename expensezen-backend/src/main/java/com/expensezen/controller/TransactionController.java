package com.expensezen.controller;

import com.expensezen.dto.request.TransactionRequest;
import com.expensezen.dto.response.PageResponse;
import com.expensezen.dto.response.TransactionResponse;
import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.TransactionType;
import com.expensezen.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService
    ) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        TransactionResponse response =
                transactionService.create(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<TransactionResponse>> getAll(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            TransactionType type,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            PaymentMethod paymentMethod,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "transactionDate")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String sortDirection,

            Authentication authentication
    ) {
        return ResponseEntity.ok(
                transactionService.getAll(
                        authentication.getName(),
                        search,
                        type,
                        categoryId,
                        paymentMethod,
                        startDate,
                        endDate,
                        page,
                        size,
                        sortBy,
                        sortDirection
                )
        );
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getById(
            @PathVariable Long transactionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                transactionService.getById(
                        authentication.getName(),
                        transactionId
                )
        );
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> update(
            @PathVariable Long transactionId,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                transactionService.update(
                        authentication.getName(),
                        transactionId,
                        request
                )
        );
    }

    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long transactionId,
            Authentication authentication
    ) {
        transactionService.delete(
                authentication.getName(),
                transactionId
        );

        return ResponseEntity.noContent().build();
    }
}