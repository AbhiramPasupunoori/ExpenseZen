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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DashboardControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void shouldReturnDashboardAnalyticsWithOwnership()
            throws Exception {

        LocalDate today = LocalDate.now();

        String firstToken = registerAndGetToken(
                "Dashboard User",
                "phase8first@expensezen.com"
        );

        long salaryCategoryId =
                findCategoryId(firstToken, "Salary");

        long foodCategoryId =
                findCategoryId(firstToken, "Food");

        long healthCategoryId =
                findCategoryId(firstToken, "Health");

        createTransaction(
                firstToken,
                salaryCategoryId,
                "Monthly Salary",
                "50000.00",
                "INCOME",
                "BANK_TRANSFER"
        );

        createTransaction(
                firstToken,
                foodCategoryId,
                "Groceries",
                "1200.00",
                "EXPENSE",
                "UPI"
        );

        createTransaction(
                firstToken,
                foodCategoryId,
                "Restaurant",
                "800.00",
                "EXPENSE",
                "CREDIT_CARD"
        );

        createTransaction(
                firstToken,
                healthCategoryId,
                "Medicine",
                "1000.00",
                "EXPENSE",
                "UPI"
        );

        mockMvc.perform(
                        get("/api/dashboard")
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
                                .param("trendMonths", "3")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.totalIncome")
                        .value(50000.00))
                .andExpect(jsonPath("$.totalExpenses")
                        .value(3000.00))
                .andExpect(jsonPath("$.balance")
                        .value(47000.00))
                .andExpect(jsonPath("$.transactionCount")
                        .value(4))
                .andExpect(jsonPath("$.categoryBreakdown.length()")
                        .value(2))
                .andExpect(jsonPath("$.categoryBreakdown[0].categoryName")
                        .value("Food"))
                .andExpect(jsonPath("$.categoryBreakdown[0].amount")
                        .value(2000.00))
                .andExpect(jsonPath("$.categoryBreakdown[0].percentage")
                        .value(66.67))
                .andExpect(jsonPath("$.monthlyTrends.length()")
                        .value(3))
                .andExpect(jsonPath("$.monthlyTrends[2].income")
                        .value(50000.00))
                .andExpect(jsonPath("$.monthlyTrends[2].expenses")
                        .value(3000.00));

        String secondToken = registerAndGetToken(
                "Second Dashboard User",
                "phase8second@expensezen.com"
        );

        mockMvc.perform(
                        get("/api/dashboard")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + secondToken
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
                .andExpect(jsonPath("$.totalIncome").value(0))
                .andExpect(jsonPath("$.totalExpenses").value(0))
                .andExpect(jsonPath("$.balance").value(0))
                .andExpect(jsonPath("$.transactionCount").value(0));
    }

    @Test
    void shouldRejectUnauthenticatedDashboardRequest()
            throws Exception {

        mockMvc.perform(
                        get("/api/dashboard")
                                .param("month", "8")
                                .param("year", "2026")
                )
                .andExpect(status().isUnauthorized());
    }

    private void createTransaction(
            String token,
            long categoryId,
            String title,
            String amount,
            String type,
            String paymentMethod
    ) throws Exception {

        String request = """
                {
                  "title": "%s",
                  "amount": %s,
                  "transactionDate": "%s",
                  "description": "Dashboard test transaction",
                  "type": "%s",
                  "paymentMethod": "%s",
                  "categoryId": %d
                }
                """.formatted(
                title,
                amount,
                LocalDate.now(),
                type,
                paymentMethod,
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