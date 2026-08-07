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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CategoryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void shouldCreateDefaultsAndManageCustomCategory()
            throws Exception {

        String token = registerAndGetToken();

        mockMvc.perform(
                        get("/api/categories")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(15));

        String createRequest = """
                {
                  "name": "Travel",
                  "type": "EXPENSE",
                  "color": "#2563EB",
                  "icon": "plane"
                }
                """;

        String createResponse = mockMvc.perform(
                        post("/api/categories")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(createRequest)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Travel"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.defaultCategory").value(false))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode createdCategory =
                jsonMapper.readTree(createResponse);

        long categoryId = createdCategory
                .get("id")
                .longValue();

        mockMvc.perform(
                        get("/api/categories/{categoryId}", categoryId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Travel"));

        String updateRequest = """
                {
                  "name": "Vacation",
                  "type": "EXPENSE",
                  "color": "#7C3AED",
                  "icon": "luggage"
                }
                """;

        mockMvc.perform(
                        put("/api/categories/{categoryId}", categoryId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Vacation"));

        mockMvc.perform(
                        delete("/api/categories/{categoryId}", categoryId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isNoContent());

        mockMvc.perform(
                        get("/api/categories/{categoryId}", categoryId)
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectUnauthenticatedCategoryRequest()
            throws Exception {

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isUnauthorized());
    }

    private String registerAndGetToken() throws Exception {
        String request = """
                {
                  "fullName": "Phase Five User",
                  "email": "phase5@expensezen.com",
                  "password": "Password@123",
                  "currency": "INR"
                }
                """;

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
}