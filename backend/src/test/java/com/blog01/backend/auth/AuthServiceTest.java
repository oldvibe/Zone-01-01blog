package com.blog01.backend.auth;

import com.blog01.backend.auth.dto.AuthResponse;
import com.blog01.backend.auth.dto.LoginRequest;
import com.blog01.backend.auth.dto.RegisterRequest;
import com.blog01.backend.common.ApiException;
import com.blog01.backend.config.security.JwtService;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password");
        
        loginRequest = new LoginRequest("test@example.com", "password");
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .build();
    }

    @Test
    void register_ShouldRegisterUser_WhenRequestIsValid() {
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(Long.valueOf(1))).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenUsernameExists() {
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class, () -> authService.register(registerRequest));
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Username already taken", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.password(), user.getPassword())).thenReturn(true);
        when(jwtService.generateToken(user.getId())).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> authService.login(loginRequest));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsInvalid() {
        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.password(), user.getPassword())).thenReturn(false);

        ApiException exception = assertThrows(ApiException.class, () -> authService.login(loginRequest));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("Invalid credentials", exception.getMessage());
    }
}
