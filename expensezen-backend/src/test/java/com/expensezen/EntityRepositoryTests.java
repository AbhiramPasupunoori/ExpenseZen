package com.expensezen;

import com.expensezen.entity.Budget;
import com.expensezen.entity.Category;
import com.expensezen.entity.SavingsGoal;
import com.expensezen.entity.Transaction;
import com.expensezen.entity.User;
import com.expensezen.enums.GoalStatus;
import com.expensezen.enums.PaymentMethod;
import com.expensezen.enums.TransactionType;
import com.expensezen.repository.BudgetRepository;
import com.expensezen.repository.CategoryRepository;
import com.expensezen.repository.SavingsGoalRepository;
import com.expensezen.repository.TransactionRepository;
import com.expensezen.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional
class EntityRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    @Test
    void shouldSaveAllExpenseZenEntities() {

        User user = new User();
        user.setFullName("Test User");
        user.setEmail("test@expensezen.com");
        user.setPassword("temporary-test-password");

        user = userRepository.save(user);

        Category category = new Category();
        category.setName("Food");
        category.setType(TransactionType.EXPENSE);
        category.setColor("#F97316");
        category.setIcon("utensils");
        category.setUser(user);

        category = categoryRepository.save(category);

        Transaction transaction = new Transaction();
        transaction.setTitle("Lunch");
        transaction.setAmount(new BigDecimal("250.00"));
        transaction.setTransactionDate(LocalDate.now());
        transaction.setDescription("Lunch expense");
        transaction.setType(TransactionType.EXPENSE);
        transaction.setPaymentMethod(PaymentMethod.UPI);
        transaction.setCategory(category);
        transaction.setUser(user);

        transaction = transactionRepository.save(transaction);

        Budget budget = new Budget();
        budget.setAmount(new BigDecimal("5000.00"));
        budget.setBudgetMonth(LocalDate.now().getMonthValue());
        budget.setBudgetYear(LocalDate.now().getYear());
        budget.setCategory(category);
        budget.setUser(user);

        budget = budgetRepository.save(budget);

        SavingsGoal goal = new SavingsGoal();
        goal.setName("New Laptop");
        goal.setTargetAmount(new BigDecimal("80000.00"));
        goal.setSavedAmount(new BigDecimal("10000.00"));
        goal.setTargetDate(LocalDate.now().plusMonths(6));
        goal.setStatus(GoalStatus.ACTIVE);
        goal.setUser(user);

        goal = savingsGoalRepository.save(goal);

        assertNotNull(user.getId());
        assertNotNull(category.getId());
        assertNotNull(transaction.getId());
        assertNotNull(budget.getId());
        assertNotNull(goal.getId());
    }
}