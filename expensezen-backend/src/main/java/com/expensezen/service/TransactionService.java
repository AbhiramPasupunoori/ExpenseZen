package com.expensezen.service;

import com.expensezen.dto.request.TransactionRequest;
import com.expensezen.dto.response.PageResponse;
import com.expensezen.dto.response.TransactionResponse;
import com.expensezen.entity.Category;
import com.expensezen.entity.Transaction;
import com.expensezen.entity.User;
import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.TransactionType;
import com.expensezen.exception.BadRequestException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.CategoryRepository;
import com.expensezen.repository.TransactionRepository;
import com.expensezen.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;

@Service
public class TransactionService {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "transactionDate",
                    "amount",
                    "title",
                    "createdAt"
            );

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransactionResponse create(
            String email,
            TransactionRequest request
    ) {
        User user = getUser(email);

        Category category = getOwnedCategory(
                request.categoryId(),
                user.getId()
        );

        validateCategoryType(category, request.type());

        Transaction transaction = new Transaction();
        applyRequest(transaction, request, category, user);

        return TransactionResponse.from(
                transactionRepository.save(transaction)
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getAll(
            String email,
            String search,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        User user = getUser(email);

        validatePagination(page, size);
        validateDateRange(startDate, endDate);
        validateSearch(search);

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BadRequestException(
                    "Invalid sort field. Allowed fields: "
                            + ALLOWED_SORT_FIELDS
            );
        }

        Sort.Direction direction;

        try {
            direction = Sort.Direction.fromString(
                    sortDirection
            );
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Sort direction must be asc or desc"
            );
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );

        Specification<Transaction> specification =
                belongsToUser(user.getId());

        if (search != null && !search.isBlank()) {
            specification = specification.and(
                    titleOrDescriptionContains(search)
            );
        }

        if (type != null) {
            specification = specification.and(
                    hasType(type)
            );
        }

        if (categoryId != null) {
            specification = specification.and(
                    hasCategory(categoryId)
            );
        }

        if (paymentMethod != null) {
            specification = specification.and(
                    hasPaymentMethod(paymentMethod)
            );
        }

        if (startDate != null) {
            specification = specification.and(
                    dateOnOrAfter(startDate)
            );
        }

        if (endDate != null) {
            specification = specification.and(
                    dateOnOrBefore(endDate)
            );
        }

        Page<TransactionResponse> results =
                transactionRepository
                        .findAll(specification, pageable)
                        .map(TransactionResponse::from);

        return PageResponse.from(results);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getById(
            String email,
            Long transactionId
    ) {
        User user = getUser(email);

        Transaction transaction = getOwnedTransaction(
                transactionId,
                user.getId()
        );

        return TransactionResponse.from(transaction);
    }

    @Transactional
    public TransactionResponse update(
            String email,
            Long transactionId,
            TransactionRequest request
    ) {
        User user = getUser(email);

        Transaction transaction = getOwnedTransaction(
                transactionId,
                user.getId()
        );

        Category category = getOwnedCategory(
                request.categoryId(),
                user.getId()
        );

        validateCategoryType(category, request.type());

        applyRequest(transaction, request, category, user);

        return TransactionResponse.from(
                transactionRepository.save(transaction)
        );
    }

    @Transactional
    public void delete(
            String email,
            Long transactionId
    ) {
        User user = getUser(email);

        Transaction transaction = getOwnedTransaction(
                transactionId,
                user.getId()
        );

        transactionRepository.delete(transaction);
    }

    private void applyRequest(
            Transaction transaction,
            TransactionRequest request,
            Category category,
            User user
    ) {
        transaction.setTitle(request.title().trim());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(
                request.transactionDate()
        );
        transaction.setDescription(
                normalizeDescription(request.description())
        );
        transaction.setType(request.type());
        transaction.setPaymentMethod(
                request.paymentMethod()
        );
        transaction.setCategory(category);
        transaction.setUser(user);
    }

    private User getUser(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User account was not found"
                        )
                );
    }

    private Category getOwnedCategory(
            Long categoryId,
            Long userId
    ) {
        return categoryRepository
                .findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category was not found"
                        )
                );
    }

    private Transaction getOwnedTransaction(
            Long transactionId,
            Long userId
    ) {
        return transactionRepository
                .findByIdAndUser_Id(transactionId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transaction was not found"
                        )
                );
    }

    private void validateCategoryType(
            Category category,
            TransactionType transactionType
    ) {
        if (category.getType() != transactionType) {
            throw new BadRequestException(
                    "Transaction type must match the category type"
            );
        }
    }

    private void validatePagination(
            int page,
            int size
    ) {
        if (page < 0) {
            throw new BadRequestException(
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "Page size must be between 1 and 100"
            );
        }
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (startDate != null
                && endDate != null
                && startDate.isAfter(endDate)) {
            throw new BadRequestException(
                    "Start date cannot be after end date"
            );
        }
    }

    private void validateSearch(String search) {
        if (search != null && search.length() > 100) {
            throw new BadRequestException(
                    "Search text cannot exceed 100 characters"
            );
        }
    }

    private String normalizeDescription(
            String description
    ) {
        if (description == null || description.isBlank()) {
            return null;
        }

        return description.trim();
    }

    private Specification<Transaction> belongsToUser(
            Long userId
    ) {
        return (root, query, builder) ->
                builder.equal(
                        root.get("user").get("id"),
                        userId
                );
    }

    private Specification<Transaction>
    titleOrDescriptionContains(String search) {
        String pattern = "%"
                + search.trim()
                        .toLowerCase(Locale.ROOT)
                + "%";

        return (root, query, builder) ->
                builder.or(
                        builder.like(
                                builder.lower(
                                        root.get("title")
                                ),
                                pattern
                        ),
                        builder.like(
                                builder.lower(
                                        root.get("description")
                                ),
                                pattern
                        )
                );
    }

    private Specification<Transaction> hasType(
            TransactionType type
    ) {
        return (root, query, builder) ->
                builder.equal(
                        root.get("type"),
                        type
                );
    }

    private Specification<Transaction> hasCategory(
            Long categoryId
    ) {
        return (root, query, builder) ->
                builder.equal(
                        root.get("category").get("id"),
                        categoryId
                );
    }

    private Specification<Transaction> hasPaymentMethod(
            PaymentMethod paymentMethod
    ) {
        return (root, query, builder) ->
                builder.equal(
                        root.get("paymentMethod"),
                        paymentMethod
                );
    }

    private Specification<Transaction> dateOnOrAfter(
            LocalDate startDate
    ) {
        return (root, query, builder) ->
                builder.greaterThanOrEqualTo(
                        root.get("transactionDate"),
                        startDate
                );
    }

    private Specification<Transaction> dateOnOrBefore(
            LocalDate endDate
    ) {
        return (root, query, builder) ->
                builder.lessThanOrEqualTo(
                        root.get("transactionDate"),
                        endDate
                );
    }
}