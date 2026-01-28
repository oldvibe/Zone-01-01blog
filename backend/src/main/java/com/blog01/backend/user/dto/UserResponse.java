package com.blog01.backend.user.dto;

import java.time.LocalDateTime;

public record UserResponse(
	Long id,
	String username,
	String email,
	String role,
	boolean enabled,
	LocalDateTime createdAt
) {}

