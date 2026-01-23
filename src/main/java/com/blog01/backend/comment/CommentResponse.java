package com.blog01.backend.comment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private String content;
    private boolean owner;
}
