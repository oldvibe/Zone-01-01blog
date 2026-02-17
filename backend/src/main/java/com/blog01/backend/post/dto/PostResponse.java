package com.blog01.backend.post.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        String content,
        List<String> mediaUrls,

        Long authorId,
        String authorUsername,

        LocalDateTime createdAt,

        long likes,
        boolean likedByMe,
        boolean mine
) {
}
