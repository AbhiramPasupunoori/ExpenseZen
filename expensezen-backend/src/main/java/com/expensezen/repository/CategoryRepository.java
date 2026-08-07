package com.expensezen.repository;

import com.expensezen.entity.Category;
import com.expensezen.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findAllByUser_IdOrderByNameAsc(
            Long userId
    );

    List<Category> findAllByUser_IdAndTypeOrderByNameAsc(
            Long userId,
            TransactionType type
    );

    Optional<Category> findByIdAndUser_Id(
            Long categoryId,
            Long userId
    );

    boolean existsByUser_IdAndNameIgnoreCaseAndType(
            Long userId,
            String name,
            TransactionType type
    );

    boolean existsByUser_IdAndNameIgnoreCaseAndTypeAndIdNot(
            Long userId,
            String name,
            TransactionType type,
            Long categoryId
    );
}
