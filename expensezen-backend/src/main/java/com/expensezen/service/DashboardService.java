package com.expensezen.service;

import com.expensezen.dto.response.CategoryBreakdownResponse;
import com.expensezen.dto.response.DashboardResponse;
import com.expensezen.dto.response.MonthlyTrendResponse;
import com.expensezen.entity.User;
import com.expensezen.enums.TransactionType;
import com.expensezen.exception.BadRequestException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.TransactionRepository;
import com.expensezen.repository.UserRepository;
import com.expensezen.repository.projection.MonthlyTrendProjection;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public DashboardService(
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(
            String email,
            Integer month,
            Integer year,
            Integer trendMonths
    ) {
        validateParameters(month, year, trendMonths);

        User user = getUser(email);

        YearMonth selectedPeriod =
                YearMonth.of(year, month);

        LocalDate monthStart =
                selectedPeriod.atDay(1);

        LocalDate monthEnd =
                selectedPeriod.atEndOfMonth();

        BigDecimal totalIncome = safeAmount(
                transactionRepository
                        .sumAmountByUserAndTypeAndPeriod(
                                user.getId(),
                                TransactionType.INCOME,
                                monthStart,
                                monthEnd
                        )
        );

        BigDecimal totalExpenses = safeAmount(
                transactionRepository
                        .sumAmountByUserAndTypeAndPeriod(
                                user.getId(),
                                TransactionType.EXPENSE,
                                monthStart,
                                monthEnd
                        )
        );

        BigDecimal balance =
                totalIncome.subtract(totalExpenses);

        long transactionCount =
                transactionRepository
                        .countByUser_IdAndTransactionDateBetween(
                                user.getId(),
                                monthStart,
                                monthEnd
                        );

        List<CategoryBreakdownResponse> breakdown =
                createCategoryBreakdown(
                        user.getId(),
                        monthStart,
                        monthEnd,
                        totalExpenses
                );

        List<MonthlyTrendResponse> trends =
                createMonthlyTrends(
                        user.getId(),
                        selectedPeriod,
                        trendMonths
                );

        return new DashboardResponse(
                month,
                year,
                user.getCurrency(),
                totalIncome,
                totalExpenses,
                balance,
                transactionCount,
                breakdown,
                trends
        );
    }

    private List<CategoryBreakdownResponse>
    createCategoryBreakdown(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal totalExpenses
    ) {
        return transactionRepository
                .findCategorySpending(
                        userId,
                        TransactionType.EXPENSE,
                        startDate,
                        endDate
                )
                .stream()
                .map(projection ->
                        CategoryBreakdownResponse.from(
                                projection,
                                totalExpenses
                        )
                )
                .toList();
    }

    private List<MonthlyTrendResponse> createMonthlyTrends(
            Long userId,
            YearMonth selectedPeriod,
            Integer trendMonths
    ) {
        YearMonth firstPeriod = selectedPeriod
                .minusMonths(trendMonths - 1L);

        LocalDate startDate = firstPeriod.atDay(1);
        LocalDate endDate = selectedPeriod.atEndOfMonth();

        List<MonthlyTrendProjection> projections =
                transactionRepository.findMonthlyTrends(
                        userId,
                        TransactionType.INCOME,
                        TransactionType.EXPENSE,
                        startDate,
                        endDate
                );

        Map<YearMonth, MonthlyTrendProjection> projectionMap =
                new HashMap<>();

        for (MonthlyTrendProjection projection : projections) {
            YearMonth period = YearMonth.of(
                    projection.getTrendYear(),
                    projection.getTrendMonth()
            );

            projectionMap.put(period, projection);
        }

        List<MonthlyTrendResponse> results =
                new ArrayList<>();

        for (int index = 0;
             index < trendMonths;
             index++) {

            YearMonth period =
                    firstPeriod.plusMonths(index);

            MonthlyTrendProjection projection =
                    projectionMap.get(period);

            BigDecimal income = projection == null
                    ? BigDecimal.ZERO
                    : safeAmount(
                            projection.getIncomeAmount()
                    );

            BigDecimal expenses = projection == null
                    ? BigDecimal.ZERO
                    : safeAmount(
                            projection.getExpenseAmount()
                    );

            String label = period.getMonth()
                    .getDisplayName(
                            TextStyle.SHORT,
                            Locale.ENGLISH
                    )
                    + " "
                    + period.getYear();

            results.add(
                    new MonthlyTrendResponse(
                            period.getYear(),
                            period.getMonthValue(),
                            label,
                            income,
                            expenses,
                            income.subtract(expenses)
                    )
            );
        }

        return results;
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

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount == null
                ? BigDecimal.ZERO
                : amount;
    }

    private void validateParameters(
            Integer month,
            Integer year,
            Integer trendMonths
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

        if (trendMonths == null
                || trendMonths < 1
                || trendMonths > 24) {
            throw new BadRequestException(
                    "Trend months must be between 1 and 24"
            );
        }
    }
}
