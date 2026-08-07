package com.expensezen.repository;

import com.expensezen.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}
