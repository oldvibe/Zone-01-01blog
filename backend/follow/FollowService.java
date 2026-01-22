package com.blog01.backend.follow;

import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public void toggleFollow(Long userId, String email) {

        User follower = userRepository.findByEmail(email).orElseThrow();
        User following = userRepository.findById(userId).orElseThrow();

        followRepository.findByFollowerAndFollowing(follower, following)
                .ifPresentOrElse(
                        followRepository::delete,
                        () -> followRepository.save(
                                Follow.builder()
                                        .follower(follower)
                                        .following(following)
                                        .build()
                        )
                );
    }
}
