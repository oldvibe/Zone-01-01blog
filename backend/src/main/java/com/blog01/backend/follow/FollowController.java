package com.blog01.backend.follow;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /**
     * 🔹 Follow / Unfollow user (toggle)
     */
    @PostMapping("/{userId}/follow")
    public void toggleFollow(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails user
    ) {
        followService.toggleFollow(userId, user.getUsername());
    }

    /**
     * 🔹 Get users that I follow
     */
    @GetMapping("/me/following")
    public List<FollowUserResponse> getMyFollowing(
            @AuthenticationPrincipal UserDetails user
    ) {
        return followService.getMyFollowing(user.getUsername());
    }

    /**
     * 🔹 Get my followers
     */
    @GetMapping("/me/followers")
    public List<FollowUserResponse> getMyFollowers(
            @AuthenticationPrincipal UserDetails user
    ) {
        return followService.getMyFollowers(user.getUsername());
    }
}
