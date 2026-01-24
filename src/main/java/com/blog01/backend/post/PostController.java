package com.blog01.backend.post;

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
     * 🔹 Public feed (all posts paginated)
     */
    @GetMapping
    public Page<Post> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return postService.getFeed(page, size);
    }

    /**
     * 🔹 Feed of users I follow
     */
    @GetMapping("/subscriptions")
    public Page<Post> getSubscriptionsFeed(
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
    public Post createPost(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody PostRequest request
    ) {
        return postService.createPost(user.getId(), request);
    }
    
    @PostMapping
    public void createPost(
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile media,
            @AuthenticationPrincipal UserDetails user
    ) {
        postService.create(content, media, user.getUsername());
    }
    

    /**
     * 🔹 Edit my post
     */
    @PutMapping("/{id}")
    public Post updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody PostRequest request
    ) {
        return postService.updatePost(id, user.getId(), request);
    }

    /**
     * 🔹 Delete my post
     */
    @DeleteMapping("/{id}")
    public void deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        postService.deletePost(id, user.getId());
    }
}
