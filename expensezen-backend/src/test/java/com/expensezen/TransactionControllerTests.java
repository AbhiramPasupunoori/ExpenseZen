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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TransactionControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void shouldManageTransactionsWithOwnershipProtection()
            throws Exception {

        String firstToken = registerAndGetToken(
                "First User",
                "phase6first@expensezen.com"
        );

        long foodCategoryId = findCategoryId(
                firstToken,
                "Food"
        );

        String createRequest = """
                {
                  "title": "Lunch",
                  "amount": 450.00,
                  "transactionDate": "%s",
                  "description": "Team lunch",
                  "type": "EXPENSE",
                  "paymentMethod": "UPI",
                  "categoryId": %d
                }
                """.formatted(
                LocalDate.now(),
                foodCategoryId
        );

        String createResponse = mockMvc.perform(
                        post("/api/transactions")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(createRequest)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Lunch"))
                .andExpect(jsonPath("$.amount").value(450.00))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.categoryName").value("Food"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long transactionId = jsonMapper
                .readTree(createResponse)
                .get("id")
                .longValue();

        mockMvc.perform(
                        get("/api/transactions")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                                .param("search", "Lunch")
                                .param("type", "EXPENSE")
                                .param("page", "0")
                                .param("size", "5")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalElements").value(1));

        String updateRequest = """
                {
                  "title": "Team Lunch",
                  "amount": 800.00,
                  "transactionDate": "%s",
                  "description": "Updated lunch expense",
                  "type": "EXPENSE",
                  "paymentMethod": "CREDIT_CARD",
                  "categoryId": %d
                }
                """.formatted(
                LocalDate.now(),
                foodCategoryId
        );

        mockMvc.perform(
                        put(
                                "/api/transactions/{transactionId}",
                                transactionId
                        )
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Team Lunch"))
                .andExpect(jsonPath("$.amount").value(800.00))
                .andExpect(jsonPath("$.paymentMethod")
                        .value("CREDIT_CARD"));

        String secondToken = registerAndGetToken(
                "Second User",
                "phase6second@expensezen.com"
        );

        mockMvc.perform(
                        get(
                                "/api/transactions/{transactionId}",
                                transactionId
                        )
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + secondToken
                                )
                )
                .andExpect(status().isNotFound());

        mockMvc.perform(
                        delete(
                                "/api/transactions/{transactionId}",
                                transactionId
                        )
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                )
                .andExpect(status().isNoContent());

        mockMvc.perform(
                        get(
                                "/api/transactions/{transactionId}",
                                transactionId
                        )
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + firstToken
                                )
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectUnauthenticatedTransactionRequest()
            throws Exception {

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isUnauthorized());
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