package com.expensezen.service;

import com.expensezen.dto.request.BudgetRequest;
import com.expensezen.dto.response.BudgetResponse;
import com.expensezen.dto.response.BudgetSummaryResponse;
import com.expensezen.entity.Budget;
import com.expensezen.entity.Category;
import com.expensezen.entity.User;
import com.expensezen.enums.TransactionType;
import com.expensezen.exception.BadRequestException;
import com.expensezen.exception.DuplicateResourceException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.BudgetRepository;
import com.expensezen.repository.CategoryRepository;
import com.expensezen.repository.TransactionRepository;
import com.expensezen.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BudgetResponse create(
            String email,
            BudgetRequest request
    ) {
        User user = getUser(email);

        Category category = getOwnedCategory(
                request.categoryId(),
                user.getId()
        );

        validateExpenseCategory(category);

        boolean exists =
                budgetRepository
                        .existsByUser_IdAndCategory_IdAndBudgetMonthAndBudgetYear(
                                user.getId(),
                                category.getId(),
                                request.month(),
                                request.year()
                        );

        if (exists) {
            throw new DuplicateResourceException(
                    "A budget already exists for this category and month"
            );
        }

        Budget budget = new Budget();
        applyRequest(budget, request, category, user);

        Budget savedBudget =
                budgetRepository.save(budget);

        return createResponse(savedBudget);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getAll(
            String email,
            Integer month,
            Integer year
    ) {
        validatePeriod(month, year);

        User user = getUser(email);

        return budgetRepository
                .findAllByUser_IdAndBudgetMonthAndBudgetYearOrderByCategory_NameAsc(
                        user.getId(),
                        month,
                        year
                )
                .stream()
                .map(this::createResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getSummary(
            String email,
            Integer month,
            Integer year
    ) {
        List<BudgetResponse> budgets =
                getAll(email, month, year);

        return BudgetSummaryResponse.from(
                month,
                year,
                budgets
        );
    }

    @Transactional(readOnly = true)
    public BudgetResponse getById(
            String email,
            Long budgetId
    ) {
        User user = getUser(email);

        Budget budget = getOwnedBudget(
                budgetId,
                user.getId()
        );

        return createResponse(budget);
    }

    @Transactional
    public BudgetResponse update(
            String email,
            Long budgetId,
            BudgetRequest request
    ) {
        User user = getUser(email);

        Budget budget = getOwnedBudget(
                budgetId,
                user.getId()
        );

        Category category = getOwnedCategory(
                request.categoryId(),
                user.getId()
        );

        validateExpenseCategory(category);

        boolean duplicate =
                budgetRepository
                        .existsByUser_IdAndCategory_IdAndBudgetMonthAndBudgetYearAndIdNot(
                                user.getId(),
                                category.getId(),
                                request.month(),
                                request.year(),
                                budgetId
                        );

        if (duplicate) {
            throw new DuplicateResourceException(
                    "A budget already exists for this category and month"
            );
        }

        applyRequest(budget, request, category, user);

        return createResponse(
                budgetRepository.save(budget)
        );
    }

    @Transactional
    public void delete(
            String email,
            Long budgetId
    ) {
        User user = getUser(email);

        Budget budget = getOwnedBudget(
                budgetId,
                user.getId()
        );

        budgetRepository.delete(budget);
    }

    private BudgetResponse createResponse(Budget budget) {
        YearMonth period = YearMonth.of(
                budget.getBudgetYear(),
                budget.getBudgetMonth()
        );

        LocalDate startDate = period.atDay(1);
        LocalDate endDate = period.atEndOfMonth();

        BigDecimal spentAmount =
                transactionRepository
                        .sumAmountByCategoryAndPeriod(
                                budget.getUser().getId(),
                                budget.getCategory().getId(),
                                TransactionType.EXPENSE,
                                startDate,
                                endDate
                        );

        return BudgetResponse.from(
                budget,
                spentAmount
        );
    }

    private void applyRequest(
            Budget budget,
            BudgetRequest request,
            Category category,
            User user
    ) {
        budget.setAmount(request.amount());
        budget.setBudgetMonth(request.month());
        budget.setBudgetYear(request.year());
        budget.setCategory(category);
        budget.setUser(user);
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

    private Budget getOwnedBudget(
            Long budgetId,
            Long userId
    ) {
        return budgetRepository
                .findByIdAndUser_Id(budgetId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Budget was not found"
                        )
                );
    }

    private void validateExpenseCategory(
            Category category
    ) {
        if (category.getType()
                != TransactionType.EXPENSE) {
            throw new BadRequestException(
                    "Budgets can only be created for expense categories"
            );
        }
    }

    private void validatePeriod(
            Integer month,
            Integer year
    ) {
        if (month == null || month < 1 || month > 12) {
            throw new BadRequestException(
                    "Month must be between 1 and 12"
            );
        }

        if (year == null || year < 2000 || year > 2100) {
            throw new BadRequestException(
                    "Year must be between 2000 and 2100"
            );
        }
    }
}