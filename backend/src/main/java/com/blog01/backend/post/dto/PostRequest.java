package com.blog01.backend.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(

        @NotBlank(message = "Post content is required")
        @Size(max = 5000, message = "Post content must not exceed 5000 characters")
        String content,

        // optional (image / video url)
        String mediaUrl
) {}
