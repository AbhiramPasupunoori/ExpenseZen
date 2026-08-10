package com.expensezen.repository;

import com.expensezen.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecurringTransactionRepository
        extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<RecurringTransaction> findByIdAndUserId(
            Long id,
            Long userId
    );

    List<RecurringTransaction>
    findByActiveTrueAndNextRunDateLessThanEqualOrderByNextRunDateAsc(
            LocalDate date
    );

    List<RecurringTransaction>
    findByUserIdAndActiveTrueAndNextRunDateLessThanEqualOrderByNextRunDateAsc(
            Long userId,
            LocalDate date
    );
}