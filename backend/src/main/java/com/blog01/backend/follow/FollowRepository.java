package com.blog01.backend.follow;

import com.blog01.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    List<Follow> findAllByFollower(User follower);

    List<Follow> findAllByFollowing(User following);

    boolean existsByFollowerAndFollowing(User follower, User following);
}
