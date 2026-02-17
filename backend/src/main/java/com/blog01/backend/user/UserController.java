package com.blog01.backend.user;

import com.blog01.backend.post.PostService;
import com.blog01.backend.post.dto.PostResponse;
import com.blog01.backend.security.UserPrincipal;
import com.blog01.backend.user.dto.UpdateUserRequest;
import com.blog01.backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PostService postService;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal user) {
        return userService.getById(user.getId());
    }

    @GetMapping("/{username}")
    public UserResponse getByUsername(@PathVariable String username) {
        return userService.getByUsername(username);
    }

    @GetMapping("/{username}/posts")
    public Page<PostResponse> postsByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return postService.getPostsByUsername(username, page, size);
    }

    @PutMapping("/me")
    public UserResponse updateMe(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody UpdateUserRequest request
    ) {
        return userService.updateProfile(user.getId(), request);
    }

    @GetMapping("/me/posts")
    public Page<PostResponse> myPosts(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return postService.getPostsByAuthor(user.getId(), page, size);
    }
}
