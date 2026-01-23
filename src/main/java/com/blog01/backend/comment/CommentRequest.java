package com.blog01.backend.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {

    @NotBlank
    private String content;
}
