package com.blog01.backend.post;

import com.blog01.backend.post.dto.PostRequest;
import com.blog01.backend.post.dto.PostResponse;
import com.blog01.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * 🔹 Public feed (all posts)
     */
    @GetMapping
    public Page<Post> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return postService.getFeed(user, page, size);
    }

    /**
     * 🔹 Feed of users I follow
     */
    @GetMapping("/subscriptions")
    public Page<PostResponse> getSubscriptionsFeed(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return postService.getSubscriptionsFeed(user.getId(), page, size);
    }

    /**
     * 🔹 Create new post
     */
    @PostMapping
    public PostResponse createPost(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PostRequest request
    ) {
        return postService.create(user.getId(), request);
    }

    /**
     * 🔹 Edit my post
     */
    @PutMapping("/{id}")
    public PostResponse updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PostRequest request
    ) {
        return postService.update(id, user.getId(), request);
    }

    /**
     * 🔹 Delete my post
     */
    @DeleteMapping("/{id}")
    public void deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        postService.delete(id, user.getId());
    }
}
