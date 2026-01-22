package com.blog01.backend.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{postId}/comments")
    public void comment(
            @PathVariable Long postId,
            @RequestBody String content,
            @AuthenticationPrincipal UserDetails user
    ) {
        commentService.addComment(postId, content, user.getUsername());
    }

    // delete comment and get the owner of every post
}

// create comment dto that hold :
// is current user own this comment
// content
// id (for delete if i'm the current user or admin)
// likes (if needed)