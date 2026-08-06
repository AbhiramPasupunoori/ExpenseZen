package com.expensezen.repository;

import com.expensezen.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findAllByUser_IdAndBudgetMonthAndBudgetYear(
            Long userId,
            Integer month,
            Integer year
    );

    Optional<Budget> findByIdAndUser_Id(
            Long budgetId,
            Long userId
    );

    Optional<Budget>
    findByUser_IdAndCategory_IdAndBudgetMonthAndBudgetYear(
            Long userId,
            Long categoryId,
            Integer month,
            Integer year
    );
}