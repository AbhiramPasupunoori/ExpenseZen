package com.expensezen.repository;

import com.expensezen.entity.Transaction;
import com.expensezen.enums.TransactionType;
import com.expensezen.repository.projection.CategorySpendingProjection;
import com.expensezen.repository.projection.MonthlyTrendProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    Page<Transaction> findAllByUser_Id(
            Long userId,
            Pageable pageable
    );

    Optional<Transaction> findByIdAndUser_Id(
            Long transactionId,
            Long userId
    );

    List<Transaction>
    findAllByUser_IdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    boolean existsByCategory_IdAndUser_Id(
            Long categoryId,
            Long userId
    );

    long countByUser_IdAndTransactionDateBetween(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.category.id = :categoryId
              AND t.type = :type
              AND t.transactionDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumAmountByCategoryAndPeriod(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = :type
              AND t.transactionDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumAmountByUserAndTypeAndPeriod(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT
                t.category.id AS categoryId,
                t.category.name AS categoryName,
                t.category.color AS categoryColor,
                t.category.icon AS categoryIcon,
                SUM(t.amount) AS totalAmount
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = :type
              AND t.transactionDate BETWEEN :startDate AND :endDate
            GROUP BY
                t.category.id,
                t.category.name,
                t.category.color,
                t.category.icon
            ORDER BY SUM(t.amount) DESC
            """)
    List<CategorySpendingProjection> findCategorySpending(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT
                YEAR(t.transactionDate) AS trendYear,
                MONTH(t.transactionDate) AS trendMonth,
                SUM(
                    CASE
                        WHEN t.type = :incomeType
                        THEN t.amount
                        ELSE 0
                    END
                ) AS incomeAmount,
                SUM(
                    CASE
                        WHEN t.type = :expenseType
                        THEN t.amount
                        ELSE 0
                    END
                ) AS expenseAmount
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.transactionDate BETWEEN :startDate AND :endDate
            GROUP BY
                YEAR(t.transactionDate),
                MONTH(t.transactionDate)
            ORDER BY
                YEAR(t.transactionDate),
                MONTH(t.transactionDate)
            """)
    List<MonthlyTrendProjection> findMonthlyTrends(
            @Param("userId") Long userId,
            @Param("incomeType") TransactionType incomeType,
            @Param("expenseType") TransactionType expenseType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT t
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.transactionDate BETWEEN :startDate AND :endDate
              AND (:type IS NULL OR t.type = :type)
            ORDER BY t.transactionDate DESC, t.id DESC
            """)
    List<Transaction> findTransactionsForCsv(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") TransactionType type
    );
}
