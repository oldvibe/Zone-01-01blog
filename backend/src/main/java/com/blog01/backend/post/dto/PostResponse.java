package com.blog01.backend.post.dto;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String content,
        String mediaUrl,

        Long authorId,
        String authorUsername,

        LocalDateTime createdAt,

        long likes,
        boolean likedByMe,
        boolean mine
) {
}
