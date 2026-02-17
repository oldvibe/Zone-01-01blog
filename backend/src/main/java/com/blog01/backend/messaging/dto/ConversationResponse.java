package com.blog01.backend.messaging.dto;

import java.time.LocalDateTime;

public record ConversationResponse(
    Long id,
    Long otherUserId,
    String otherUsername,
    LocalDateTime lastMessageAt
) {}
