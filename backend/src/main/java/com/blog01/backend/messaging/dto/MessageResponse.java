package com.blog01.backend.messaging.dto;

import java.time.LocalDateTime;

public record MessageResponse(
    Long id,
    Long senderId,
    String senderUsername,
    String content,
    LocalDateTime createdAt
) {}
