package com.expensezen.service;

import com.expensezen.entity.Category;
import com.expensezen.entity.User;
import com.expensezen.enums.TransactionType;
import com.expensezen.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DefaultCategoryService {

    private final CategoryRepository categoryRepository;

    public DefaultCategoryService(
            CategoryRepository categoryRepository
    ) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public void createDefaultCategories(User user) {
        List<CategoryTemplate> templates = List.of(

                new CategoryTemplate(
                        "Food",
                        TransactionType.EXPENSE,
                        "#EF4444",
                        "utensils"
                ),
                new CategoryTemplate(
                        "Transport",
                        TransactionType.EXPENSE,
                        "#3B82F6",
                        "car"
                ),
                new CategoryTemplate(
                        "Shopping",
                        TransactionType.EXPENSE,
                        "#EC4899",
                        "shopping-bag"
                ),
                new CategoryTemplate(
                        "Bills & Utilities",
                        TransactionType.EXPENSE,
                        "#F59E0B",
                        "receipt"
                ),
                new CategoryTemplate(
                        "Health",
                        TransactionType.EXPENSE,
                        "#10B981",
                        "heart-pulse"
                ),
                new CategoryTemplate(
                        "Education",
                        TransactionType.EXPENSE,
                        "#8B5CF6",
                        "graduation-cap"
                ),
                new CategoryTemplate(
                        "Entertainment",
                        TransactionType.EXPENSE,
                        "#6366F1",
                        "film"
                ),
                new CategoryTemplate(
                        "Rent",
                        TransactionType.EXPENSE,
                        "#F97316",
                        "house"
                ),
                new CategoryTemplate(
                        "Other Expense",
                        TransactionType.EXPENSE,
                        "#64748B",
                        "circle-ellipsis"
                ),

                new CategoryTemplate(
                        "Salary",
                        TransactionType.INCOME,
                        "#22C55E",
                        "wallet-cards"
                ),
                new CategoryTemplate(
                        "Freelance",
                        TransactionType.INCOME,
                        "#14B8A6",
                        "laptop"
                ),
                new CategoryTemplate(
                        "Business",
                        TransactionType.INCOME,
                        "#0EA5E9",
                        "briefcase-business"
                ),
                new CategoryTemplate(
                        "Investment",
                        TransactionType.INCOME,
                        "#84CC16",
                        "chart-line"
                ),
                new CategoryTemplate(
                        "Gift",
                        TransactionType.INCOME,
                        "#A855F7",
                        "gift"
                ),
                new CategoryTemplate(
                        "Other Income",
                        TransactionType.INCOME,
                        "#16A34A",
                        "circle-plus"
                )
        );

        for (CategoryTemplate template : templates) {
            boolean exists =
                    categoryRepository
                            .existsByUser_IdAndNameIgnoreCaseAndType(
                                    user.getId(),
                                    template.name(),
                                    template.type()
                            );

            if (!exists) {
                Category category = new Category();
                category.setName(template.name());
                category.setType(template.type());
                category.setColor(template.color());
                category.setIcon(template.icon());
                category.setDefaultCategory(true);
                category.setUser(user);

                categoryRepository.save(category);
            }
        }
    }

    private record CategoryTemplate(
            String name,
            TransactionType type,
            String color,
            String icon
    ) {
    }
}