package com.expensezen;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BudgetControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void shouldCalculateBudgetUsageAndProtectOwnership()
            throws Exception {

        LocalDate today = LocalDate.now();

        String firstToken = registerAndGetToken(
                "Budget User",
                "phase7first@expensezen.com"
        );

        long foodCategoryId = findCategoryId(
                firstToken,
                "Food"
        );

        String budgetRequest = """
                {
                  "amount": 1000.00,
                  "month": %d,
                  "year": %d,
                  "categoryId": %d
                }
                """.formatted(
                today.getMonthValue(),
                today.getYear(),
                foodCategoryId
        );

        String budgetResponse = mockMvc.perform(
                        post("/api/budgets")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(budgetRequest)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SAFE"))
                .andExpect(jsonPath("$.spentAmount").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long budgetId = jsonMapper
                .readTree(budgetResponse)
                .get("id")
                .longValue();

        mockMvc.perform(
                        post("/api/budgets")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(budgetRequest)
                )
                .andExpect(status().isConflict());

        createExpense(
                firstToken,
                foodCategoryId,
                "850.00",
                "Groceries"
        );

        mockMvc.perform(
                        get("/api/budgets/{budgetId}", budgetId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.spentAmount").value(850.00))
                .andExpect(jsonPath("$.remainingAmount").value(150.00))
                .andExpect(jsonPath("$.usagePercentage").value(85.00))
                .andExpect(jsonPath("$.status").value("WARNING"));

        createExpense(
                firstToken,
                foodCategoryId,
                "250.00",
                "Dinner"
        );

        mockMvc.perform(
                        get("/api/budgets/{budgetId}", budgetId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.spentAmount").value(1100.00))
                .andExpect(jsonPath("$.remainingAmount").value(-100.00))
                .andExpect(jsonPath("$.status").value("EXCEEDED"));

        mockMvc.perform(
                        get("/api/budgets/summary")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                                .param(
                                        "month",
                                        String.valueOf(
                                                today.getMonthValue()
                                        )
                                )
                                .param(
                                        "year",
                                        String.valueOf(
                                                today.getYear()
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBudget")
                        .value(1000.00))
                .andExpect(jsonPath("$.totalSpent")
                        .value(1100.00))
                .andExpect(jsonPath("$.overallStatus")
                        .value("EXCEEDED"))
                .andExpect(jsonPath("$.exceededCount")
                        .value(1));

        String secondToken = registerAndGetToken(
                "Second Budget User",
                "phase7second@expensezen.com"
        );

        mockMvc.perform(
                        get("/api/budgets/{budgetId}", budgetId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + secondToken
                                )
                )
                .andExpect(status().isNotFound());

        mockMvc.perform(
                        delete("/api/budgets/{budgetId}", budgetId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                )
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldRejectUnauthenticatedBudgetRequest()
            throws Exception {

        mockMvc.perform(
                        get("/api/budgets")
                                .param("month", "8")
                                .param("year", "2026")
                )
                .andExpect(status().isUnauthorized());
    }

    private void createExpense(
            String token,
            long categoryId,
            String amount,
            String title
    ) throws Exception {

        String request = """
                {
                  "title": "%s",
                  "amount": %s,
                  "transactionDate": "%s",
                  "description": "Budget test expense",
                  "type": "EXPENSE",
                  "paymentMethod": "UPI",
                  "categoryId": %d
                }
                """.formatted(
                title,
                amount,
                LocalDate.now(),
                categoryId
        );

        mockMvc.perform(
                        post("/api/transactions")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(request)
                )
                .andExpect(status().isCreated());
    }

    private String registerAndGetToken(
            String fullName,
            String email
    ) throws Exception {

        String request = """
                {
                  "fullName": "%s",
                  "email": "%s",
                  "password": "Password@123",
                  "currency": "INR"
                }
                """.formatted(fullName, email);

        String response = mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(request)
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return jsonMapper
                .readTree(response)
                .get("accessToken")
                .stringValue();
    }

    private long findCategoryId(
            String token,
            String categoryName
    ) throws Exception {

        String response = mockMvc.perform(
                        get("/api/categories")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode categories = jsonMapper.readTree(response);

        for (JsonNode category : categories) {
            if (categoryName.equals(
                    category.get("name").stringValue()
            )) {
                return category.get("id").longValue();
            }
        }

        throw new IllegalStateException(
                "Required category was not created"
        );
    }
}