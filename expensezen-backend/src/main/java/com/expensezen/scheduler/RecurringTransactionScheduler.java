package com.expensezen.scheduler;

import com.expensezen.service.RecurringTransactionService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransactionScheduler {

    private final RecurringTransactionService recurringService;

    public RecurringTransactionScheduler(
            RecurringTransactionService recurringService
    ) {
        this.recurringService = recurringService;
    }

    @Scheduled(
            cron = "${app.recurring.cron:0 5 0 * * *}",
            zone = "${app.time-zone:Asia/Kolkata}"
    )
    public void generateDueTransactions() {
        recurringService.processDueForAllUsers();
    }
}