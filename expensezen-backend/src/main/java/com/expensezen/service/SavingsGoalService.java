package com.expensezen.service;

import com.expensezen.dto.request.GoalContributionRequest;
import com.expensezen.dto.request.SavingsGoalRequest;
import com.expensezen.dto.response.SavingsGoalResponse;
import com.expensezen.entity.SavingsGoal;
import com.expensezen.entity.User;
import com.expensezen.enums.GoalStatus;
import com.expensezen.exception.BadRequestException;
import com.expensezen.exception.ResourceNotFoundException;
import com.expensezen.repository.SavingsGoalRepository;
import com.expensezen.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    public SavingsGoalService(
            SavingsGoalRepository savingsGoalRepository,
            UserRepository userRepository
    ) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SavingsGoalResponse create(SavingsGoalRequest request) {
        User user = getCurrentUser();

        SavingsGoal goal = new SavingsGoal();
        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount());
        goal.setSavedAmount(request.initialAmount());
        goal.setTargetDate(request.targetDate());
        goal.setStatus(calculateStatus(
                request.initialAmount(),
                request.targetAmount()
        ));
        goal.setUser(user);

        return toResponse(savingsGoalRepository.save(goal));
    }

    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> getAll() {
        User user = getCurrentUser();

        return savingsGoalRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SavingsGoalResponse getById(Long goalId) {
        return toResponse(findOwnedGoal(goalId));
    }

    @Transactional
    public SavingsGoalResponse update(
            Long goalId,
            SavingsGoalRequest request
    ) {
        SavingsGoal goal = findOwnedGoal(goalId);

        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount());
        goal.setTargetDate(request.targetDate());

        if (goal.getStatus() != GoalStatus.CANCELLED) {
            goal.setStatus(calculateStatus(
                    goal.getSavedAmount(),
                    request.targetAmount()
            ));
        }

        return toResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse contribute(
            Long goalId,
            GoalContributionRequest request
    ) {
        SavingsGoal goal = findOwnedGoal(goalId);

        if (goal.getStatus() == GoalStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cannot add money to a cancelled savings goal"
            );
        }

        BigDecimal updatedAmount =
                goal.getSavedAmount().add(request.amount());

        goal.setSavedAmount(updatedAmount);
        goal.setStatus(calculateStatus(
                updatedAmount,
                goal.getTargetAmount()
        ));

        return toResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse cancel(Long goalId) {
        SavingsGoal goal = findOwnedGoal(goalId);
        goal.setStatus(GoalStatus.CANCELLED);

        return toResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public void delete(Long goalId) {
        savingsGoalRepository.delete(findOwnedGoal(goalId));
    }

    private SavingsGoal findOwnedGoal(Long goalId) {
        User user = getCurrentUser();

        return savingsGoalRepository
                .findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Savings goal was not found"
                ));
    }

    private GoalStatus calculateStatus(
            BigDecimal saved,
            BigDecimal target
    ) {
        return saved.compareTo(target) >= 0
                ? GoalStatus.COMPLETED
                : GoalStatus.ACTIVE;
    }

    private SavingsGoalResponse toResponse(SavingsGoal goal) {
        BigDecimal remaining = goal.getTargetAmount()
                .subtract(goal.getSavedAmount())
                .max(BigDecimal.ZERO);

        BigDecimal percentage = goal.getSavedAmount()
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        goal.getTargetAmount(),
                        2,
                        RoundingMode.HALF_UP
                )
                .min(BigDecimal.valueOf(100));

        return new SavingsGoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getSavedAmount(),
                remaining,
                percentage,
                goal.getTargetDate(),
                goal.getStatus(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user was not found"
                ));
    }
}
