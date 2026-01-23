package com.blog01.backend.follow;

import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    /**
     * 🔹 Follow / Unfollow (toggle)
     */
    public void toggleFollow(Long targetUserId, String currentUserEmail) {

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }

        followRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .ifPresentOrElse(
                        followRepository::delete,
                        () -> {
                            Follow follow = Follow.builder()
                                    .follower(currentUser)
                                    .following(targetUser)
                                    .build();
                            followRepository.save(follow);
                        }
                );
    }

    /**
     * 🔹 Users that I follow
     */
    public List<FollowUserResponse> getMyFollowing(String email) {

        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return followRepository.findAllByFollower(me)
                .stream()
                .map(follow -> new FollowUserResponse(
                        follow.getFollowing().getId(),
                        follow.getFollowing().getUsername()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 🔹 Users that follow me
     */
    public List<FollowUserResponse> getMyFollowers(String email) {

        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return followRepository.findAllByFollowing(me)
                .stream()
                .map(follow -> new FollowUserResponse(
                        follow.getFollower().getId(),
                        follow.getFollower().getUsername()
                ))
                .collect(Collectors.toList());
    }
}
