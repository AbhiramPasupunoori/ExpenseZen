package com.expensezen.service;

import com.expensezen.dto.request.CategoryRequest;
import com.expensezen.dto.response.CategoryResponse;
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

import java.util.List;

@Service
public class CategoryService {

    private static final String DEFAULT_COLOR = "#64748B";
    private static final String DEFAULT_ICON = "wallet";

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    @Transactional
    public CategoryResponse create(
            String email,
            CategoryRequest request
    ) {
        User user = getUser(email);
        String categoryName = request.name().trim();

        boolean exists =
                categoryRepository
                        .existsByUser_IdAndNameIgnoreCaseAndType(
                                user.getId(),
                                categoryName,
                                request.type()
                        );

        if (exists) {
            throw new DuplicateResourceException(
                    "A category with this name and type already exists"
            );
        }

        Category category = new Category();
        category.setName(categoryName);
        category.setType(request.type());
        category.setColor(normalizeColor(request.color()));
        category.setIcon(normalizeIcon(request.icon()));
        category.setDefaultCategory(false);
        category.setUser(user);

        return CategoryResponse.from(
                categoryRepository.save(category)
        );
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll(
            String email,
            TransactionType type
    ) {
        User user = getUser(email);

        List<Category> categories;

        if (type == null) {
            categories =
                    categoryRepository
                            .findAllByUser_IdOrderByNameAsc(
                                    user.getId()
                            );
        } else {
            categories =
                    categoryRepository
                            .findAllByUser_IdAndTypeOrderByNameAsc(
                                    user.getId(),
                                    type
                            );
        }

        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(
            String email,
            Long categoryId
    ) {
        User user = getUser(email);

        Category category = getOwnedCategory(
                categoryId,
                user.getId()
        );

        return CategoryResponse.from(category);
    }

    @Transactional
    public CategoryResponse update(
            String email,
            Long categoryId,
            CategoryRequest request
    ) {
        User user = getUser(email);

        Category category = getOwnedCategory(
                categoryId,
                user.getId()
        );

        String categoryName = request.name().trim();

        boolean duplicate =
                categoryRepository
                        .existsByUser_IdAndNameIgnoreCaseAndTypeAndIdNot(
                                user.getId(),
                                categoryName,
                                request.type(),
                                categoryId
                        );

        if (duplicate) {
            throw new DuplicateResourceException(
                    "A category with this name and type already exists"
            );
        }

        boolean categoryIsUsed =
                transactionRepository
                        .existsByCategory_IdAndUser_Id(
                                categoryId,
                                user.getId()
                        )
                        ||
                        budgetRepository
                                .existsByCategory_IdAndUser_Id(
                                        categoryId,
                                        user.getId()
                                );

        if (categoryIsUsed
                && category.getType() != request.type()) {
            throw new BadRequestException(
                    "The type of a category already in use cannot be changed"
            );
        }

        category.setName(categoryName);
        category.setType(request.type());
        category.setColor(normalizeColor(request.color()));
        category.setIcon(normalizeIcon(request.icon()));

        return CategoryResponse.from(
                categoryRepository.save(category)
        );
    }

    @Transactional
    public void delete(
            String email,
            Long categoryId
    ) {
        User user = getUser(email);

        Category category = getOwnedCategory(
                categoryId,
                user.getId()
        );

        boolean usedByTransaction =
                transactionRepository
                        .existsByCategory_IdAndUser_Id(
                                categoryId,
                                user.getId()
                        );

        boolean usedByBudget =
                budgetRepository
                        .existsByCategory_IdAndUser_Id(
                                categoryId,
                                user.getId()
                        );

        if (usedByTransaction || usedByBudget) {
            throw new BadRequestException(
                    "This category cannot be deleted because it is in use"
            );
        }

        categoryRepository.delete(category);
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
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

    private String normalizeColor(String color) {
        if (color == null || color.isBlank()) {
            return DEFAULT_COLOR;
        }

        return color.trim().toUpperCase();
    }

    private String normalizeIcon(String icon) {
        if (icon == null || icon.isBlank()) {
            return DEFAULT_ICON;
        }

        return icon.trim();
    }
}