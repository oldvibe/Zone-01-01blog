package com.blog01.backend.follow;

import com.blog01.backend.common.ApiException;
import com.blog01.backend.notification.NotificationService;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * 🔹 Follow / Unfollow (toggle)
     */
    public void toggleFollow(Long targetUserId, String currentUsername) {

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot follow yourself");
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
                            
                            // Send notification
                            notificationService.notifyUser(
                                targetUser,
                                currentUser.getUsername() + " started following you"
                            );
                        }
                );
    }

    /**
     * 🔹 Users that I follow
     */
    public List<FollowUserResponse> getMyFollowing(String username) {

        User me = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return followRepository.findAllByFollower(me)
                .stream()
                .map(follow -> new FollowUserResponse(
                        follow.getFollowing().getId(),
                        follow.getFollowing().getUsername()
                ))
                .toList();
    }

    /**
     * 🔹 Users that follow me
     */
    public List<FollowUserResponse> getMyFollowers(String username) {

        User me = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return followRepository.findAllByFollowing(me)
                .stream()
                .map(follow -> new FollowUserResponse(
                        follow.getFollower().getId(),
                        follow.getFollower().getUsername()
                ))
                .toList();
    }
}
