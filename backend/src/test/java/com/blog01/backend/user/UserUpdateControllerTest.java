package com.blog01.backend.user;

import com.blog01.backend.common.enums.Role;
import com.blog01.backend.config.security.JwtService;
import com.blog01.backend.user.dto.UpdateUserRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserUpdateControllerTest {

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
        if (userRepository.findByUsername("profileuser").isEmpty()) {
            userRepository.save(User.builder()
                    .username("profileuser")
                    .email("profile@example.com")
                    .password("secret")
                    .role(Role.ROLE_USER)
                    .enabled(true)
                    .build());
        }
        token = jwtService.generateToken("profileuser");
    }

    @Test
    void updateProfile() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("updateduser");
        request.setEmail("updated@example.com");

        mockMvc.perform(
                        put("/api/users/me")
                                .header("Authorization", "Bearer " + token)
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updateduser"))
                .andExpect(jsonPath("$.email").value("updated@example.com"));

        User updated = userRepository.findByUsername("updateduser").orElseThrow();
        assertThat(updated.getEmail()).isEqualTo("updated@example.com");
    }
}
