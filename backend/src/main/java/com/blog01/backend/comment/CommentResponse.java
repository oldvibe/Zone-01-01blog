package com.blog01.backend.comment;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private String content;
    private String author;
    private boolean owner;
    private LocalDateTime createdAt;
}
