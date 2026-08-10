package com.expensezen.service;

import com.expensezen.entity.Transaction;
import com.expensezen.entity.User;
import com.expensezen.enums.TransactionType;
import com.expensezen.exception.BadRequestException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.TransactionRepository;
import com.expensezen.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public ReportService(
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateTransactionCsv(
            LocalDate startDate,
            LocalDate endDate,
            TransactionType type
    ) {
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException(
                    "End date cannot be before start date"
            );
        }

        if (ChronoUnit.DAYS.between(startDate, endDate) > 366) {
            throw new BadRequestException(
                    "CSV report range cannot exceed 366 days"
            );
        }

        User user = getCurrentUser();

        List<Transaction> transactions =
                transactionRepository.findTransactionsForCsv(
                        user.getId(),
                        startDate,
                        endDate,
                        type
                );

        StringBuilder csv = new StringBuilder();

        // UTF-8 BOM improves Excel compatibility.
        csv.append('\uFEFF');
        csv.append(
                "ID,Date,Title,Type,Category,Amount," +
                "Payment Method,Description\n"
        );

        for (Transaction transaction : transactions) {
            csv.append(transaction.getId()).append(",");
            csv.append(transaction.getTransactionDate()).append(",");
            csv.append(csvCell(transaction.getTitle())).append(",");
            csv.append(transaction.getType()).append(",");
            csv.append(csvCell(
                    transaction.getCategory().getName()
            )).append(",");
            csv.append(transaction.getAmount()).append(",");
            csv.append(transaction.getPaymentMethod()).append(",");
            csv.append(csvCell(transaction.getDescription()));
            csv.append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String csvCell(String value) {
        if (value == null) {
            return "\"\"";
        }

        String safeValue = value;

        // Prevent spreadsheet formula execution.
        if (!safeValue.isEmpty()
                && "=+-@".indexOf(safeValue.charAt(0)) >= 0) {
            safeValue = "'" + safeValue;
        }

        safeValue = safeValue.replace("\"", "\"\"");

        return "\"" + safeValue + "\"";
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user was not found"
                ));
    }
}
