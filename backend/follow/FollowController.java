package com.blog01.backend.follow;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{userId}/follow")
    public void follow(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails user
    ) {
        followService.toggleFollow(userId, user.getUsername());
    }
    // may OK(just follow and unfollow + you should to add a method that get the users that i follow them in follow service)
}
