package com.blog01.backend.report;

import com.blog01.backend.common.enums.Role;
import com.blog01.backend.config.security.JwtService;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private String token;

    @BeforeEach
    void setup() {
        if (userRepository.findByUsername("reporter").isEmpty()) {
            userRepository.save(User.builder()
                    .username("reporter")
                    .email("reporter@example.com")
                    .password("secret")
                    .role(Role.ROLE_USER)
                    .enabled(true)
                    .build());
        }
        token = jwtService.generateToken("reporter");
    }

    @Test
    void createReportForPost() throws Exception {
        ReportRequest request = new ReportRequest();
        request.setReason("spam");
        request.setTargetType("POST");
        request.setTargetId(123L);

        mockMvc.perform(
                        post("/api/reports")
                                .header("Authorization", "Bearer " + token)
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.reason").value("spam"))
                .andExpect(jsonPath("$.targetType").value("POST"))
                .andExpect(jsonPath("$.targetId").value(123))
                .andExpect(jsonPath("$.reporterUsername").value("reporter"))
                .andExpect(jsonPath("$.resolved").value(false));
    }
}
