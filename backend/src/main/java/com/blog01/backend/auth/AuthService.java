package com.blog01.backend.auth;

import com.blog01.backend.auth.dto.AuthResponse;
import com.blog01.backend.auth.dto.LoginRequest;
import com.blog01.backend.auth.dto.RegisterRequest;
import com.blog01.backend.common.ApiException;
import com.blog01.backend.common.enums.Role;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.blog01.backend.config.security.JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user: {}", request.getUsername());

        // ✅ check username
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username {} already taken", request.getUsername());
            throw new ApiException(HttpStatus.CONFLICT, "Username already taken");
        }

        // ✅ check email
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email {} already in use", request.getEmail());
            throw new ApiException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .enabled(true)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getUsername());

        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.email());
        
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found for email {}", request.email());
                    return new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user {}", user.getUsername());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!user.isEnabled()) {
            log.warn("Login failed: Account is disabled for user {}", user.getUsername());
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account has been banned");
        }

        String token = jwtService.generateToken(user.getId());
        log.info("User logged in successfully: {}", user.getUsername());
        
        return new AuthResponse(token);
    }
}
