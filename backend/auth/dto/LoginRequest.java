package com.blog01.backend.auth.dto;

public record LoginRequest(
        String email,
        String password
) {}
