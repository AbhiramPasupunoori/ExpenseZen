package com.expensezen.repository;

import com.expensezen.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavingsGoalRepository
        extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findAllByUser_IdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<SavingsGoal> findByIdAndUser_Id(
            Long goalId,
            Long userId
    );
}