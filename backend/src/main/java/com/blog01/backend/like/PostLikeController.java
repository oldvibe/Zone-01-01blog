package com.blog01.backend.like;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService likeService;

    @PostMapping("/{postId}/like")
    public void likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails user
    ) {
        likeService.toggleLike(postId, user.getUsername());
    }
}
