package com.expensezen;

import com.expensezen.entity.User;
import com.expensezen.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void shouldRegisterLoginAndAccessProtectedEndpoint()
            throws Exception {

        String registerRequest = """
                {
                  "fullName": "ExpenseZen Test User",
                  "email": "phase4@expensezen.com",
                  "password": "Password@123",
                  "currency": "INR"
                }
                """;

        String registrationResponse = mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerRequest)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email")
                        .value("phase4@expensezen.com"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        User savedUser = userRepository
                .findByEmailIgnoreCase("phase4@expensezen.com")
                .orElseThrow();

        assertNotEquals(
                "Password@123",
                savedUser.getPassword()
        );

        assertTrue(
                passwordEncoder.matches(
                        "Password@123",
                        savedUser.getPassword()
                )
        );

        JsonNode responseJson =
                jsonMapper.readTree(registrationResponse);

        String token = responseJson
                .get("accessToken")
                .stringValue();

        mockMvc.perform(
                        get("/api/auth/me")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email")
                        .value("phase4@expensezen.com"));

        String loginRequest = """
                {
                  "email": "phase4@expensezen.com",
                  "password": "Password@123"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginRequest)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void shouldRejectUnauthenticatedProtectedRequest()
            throws Exception {

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}