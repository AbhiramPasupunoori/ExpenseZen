package com.expensezen.controller;

import com.expensezen.enums.TransactionType;
import com.expensezen.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping(
            value = "/transactions.csv",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]> downloadTransactions(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false)
            TransactionType type
    ) {
        byte[] csv = reportService.generateTransactionCsv(
                startDate,
                endDate,
                type
        );

        String filename = "expensezen-transactions-"
                + startDate + "-to-" + endDate + ".csv";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\""
                )
                .contentType(MediaType.parseMediaType(
                        "text/csv;charset=UTF-8"
                ))
                .body(csv);
    }
}