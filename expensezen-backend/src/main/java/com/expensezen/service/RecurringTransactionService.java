package com.expensezen.service;

import com.expensezen.dto.request.RecurringTransactionRequest;
import com.expensezen.dto.response.RecurringTransactionResponse;
import com.expensezen.entity.Category;
import com.expensezen.entity.RecurringTransaction;
import com.expensezen.entity.Transaction;
import com.expensezen.entity.User;
import com.expensezen.enums.RecurrenceFrequency;
import com.expensezen.exception.BadRequestException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.CategoryRepository;
import com.expensezen.repository.RecurringTransactionRepository;
import com.expensezen.repository.TransactionRepository;
import com.expensezen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ZoneId applicationZone;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringRepository,
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            @Value("${app.time-zone:Asia/Kolkata}") String timeZone
    ) {
        this.recurringRepository = recurringRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.applicationZone = ZoneId.of(timeZone);
    }

    @Transactional
    public RecurringTransactionResponse create(
            RecurringTransactionRequest request
    ) {
        User user = getCurrentUser();
        Category category = getOwnedCategory(
                request.categoryId(),
                user.getId()
        );

        validateRequest(request, category);

        RecurringTransaction recurring = new RecurringTransaction();
        applyRequest(recurring, request, category);
        recurring.setNextRunDate(request.startDate());
        recurring.setActive(true);
        recurring.setUser(user);

        return toResponse(recurringRepository.save(recurring));
    }

    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> getAll() {
        User user = getCurrentUser();

        return recurringRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RecurringTransactionResponse update(
            Long recurringId,
            RecurringTransactionRequest request
    ) {
        User user = getCurrentUser();
        RecurringTransaction recurring =
                findOwnedRecurring(recurringId, user.getId());

        Category category = getOwnedCategory(
                request.categoryId(),
                user.getId()
        );

        validateRequest(request, category);
        applyRequest(recurring, request, category);

        if (request.startDate().isAfter(recurring.getNextRunDate())) {
            recurring.setNextRunDate(request.startDate());
        }

        return toResponse(recurringRepository.save(recurring));
    }

    @Transactional
    public RecurringTransactionResponse toggle(
            Long recurringId
    ) {
        User user = getCurrentUser();
        RecurringTransaction recurring =
                findOwnedRecurring(recurringId, user.getId());

        recurring.setActive(!recurring.isActive());

        return toResponse(recurringRepository.save(recurring));
    }

    @Transactional
    public void delete(Long recurringId) {
        User user = getCurrentUser();

        recurringRepository.delete(
                findOwnedRecurring(recurringId, user.getId())
        );
    }

    @Transactional
    public int processDueForCurrentUser() {
        User user = getCurrentUser();
        LocalDate today = LocalDate.now(applicationZone);

        List<RecurringTransaction> due =
                recurringRepository
                        .findByUserIdAndActiveTrueAndNextRunDateLessThanEqualOrderByNextRunDateAsc(
                                user.getId(),
                                today
                        );

        return processDueTransactions(due, today);
    }

    @Transactional
    public int processDueForAllUsers() {
        LocalDate today = LocalDate.now(applicationZone);

        List<RecurringTransaction> due =
                recurringRepository
                        .findByActiveTrueAndNextRunDateLessThanEqualOrderByNextRunDateAsc(
                                today
                        );

        return processDueTransactions(due, today);
    }

    private int processDueTransactions(
            List<RecurringTransaction> recurringTransactions,
            LocalDate today
    ) {
        int generatedCount = 0;

        for (RecurringTransaction recurring : recurringTransactions) {
            while (recurring.isActive()
                    && !recurring.getNextRunDate().isAfter(today)) {

                LocalDate dueDate = recurring.getNextRunDate();

                if (recurring.getEndDate() != null
                        && dueDate.isAfter(recurring.getEndDate())) {
                    recurring.setActive(false);
                    break;
                }

                createTransaction(recurring, dueDate);
                generatedCount++;

                LocalDate nextDate = calculateNextDate(
                        dueDate,
                        recurring.getFrequency()
                );

                recurring.setNextRunDate(nextDate);

                if (recurring.getEndDate() != null
                        && nextDate.isAfter(recurring.getEndDate())) {
                    recurring.setActive(false);
                }
            }

            recurringRepository.save(recurring);
        }

        return generatedCount;
    }

    private void createTransaction(
            RecurringTransaction recurring,
            LocalDate dueDate
    ) {
        Transaction transaction = new Transaction();
        transaction.setTitle(recurring.getTitle());
        transaction.setAmount(recurring.getAmount());
        transaction.setDescription(recurring.getDescription());
        transaction.setTransactionDate(dueDate);
        transaction.setType(recurring.getType());
        transaction.setPaymentMethod(recurring.getPaymentMethod());
        transaction.setCategory(recurring.getCategory());
        transaction.setUser(recurring.getUser());

        transactionRepository.save(transaction);
    }

    private LocalDate calculateNextDate(
            LocalDate date,
            RecurrenceFrequency frequency
    ) {
        return switch (frequency) {
            case DAILY -> date.plusDays(1);
            case WEEKLY -> date.plusWeeks(1);
            case MONTHLY -> date.plusMonths(1);
            case YEARLY -> date.plusYears(1);
        };
    }

    private void validateRequest(
            RecurringTransactionRequest request,
            Category category
    ) {
        if (request.endDate() != null
                && request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException(
                    "End date cannot be before start date"
            );
        }

        if (category.getType() != request.type()) {
            throw new BadRequestException(
                    "Category type must match transaction type"
            );
        }
    }

    private void applyRequest(
            RecurringTransaction recurring,
            RecurringTransactionRequest request,
            Category category
    ) {
        recurring.setTitle(request.title().trim());
        recurring.setAmount(request.amount());
        recurring.setDescription(request.description());
        recurring.setType(request.type());
        recurring.setPaymentMethod(request.paymentMethod());
        recurring.setFrequency(request.frequency());
        recurring.setStartDate(request.startDate());
        recurring.setEndDate(request.endDate());
        recurring.setCategory(category);
    }

    private Category getOwnedCategory(
            Long categoryId,
            Long userId
    ) {
        return categoryRepository
                .findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category was not found"
                ));
    }

    private RecurringTransaction findOwnedRecurring(
            Long recurringId,
            Long userId
    ) {
        return recurringRepository
                .findByIdAndUserId(recurringId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recurring transaction was not found"
                ));
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

    private RecurringTransactionResponse toResponse(
            RecurringTransaction recurring
    ) {
        return new RecurringTransactionResponse(
                recurring.getId(),
                recurring.getTitle(),
                recurring.getAmount(),
                recurring.getDescription(),
                recurring.getType(),
                recurring.getPaymentMethod(),
                recurring.getFrequency(),
                recurring.getStartDate(),
                recurring.getNextRunDate(),
                recurring.getEndDate(),
                recurring.isActive(),
                recurring.getCategory().getId(),
                recurring.getCategory().getName()
        );
    }
}
