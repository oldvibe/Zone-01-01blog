package com.blog01.backend;

import com.blog01.backend.common.enums.Role;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@blog.com").isEmpty() && !userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@blog.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ROLE_ADMIN)
                        .enabled(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                userRepository.save(admin);
                System.out.println("Default admin user created: admin@blog.com / admin123");
            }
        };
    }
}

