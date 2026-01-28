package com.blog01.backend.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * 🔹 Get comments of a post
     */
    @GetMapping("/{postId}/comments")
    public List<CommentResponse> getComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails user
    ) {
        return commentService.getComments(postId, user.getUsername());
    }

    /**
     * 🔹 Add comment
     */
    @PostMapping("/{postId}/comments")
    public CommentResponse addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        return commentService.addComment(postId, request.getContent(), user.getUsername());
    }

    /**
     * 🔹 Delete comment (owner or admin)
     */
    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails user
    ) {
        commentService.deleteComment(commentId, user.getUsername());
    }
}
