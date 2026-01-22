package com.blog01.backend.post.dto;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String content,
        String author,
        LocalDateTime createdAt,
        long likes
) {}
