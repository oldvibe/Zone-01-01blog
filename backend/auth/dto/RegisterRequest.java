package com.blog01.backend.auth.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(

        @NotBlank
        String username,

        @Email
        String email,

        @Size(min = 6)
        String password
) {}
