package com.blog01.backend.like;

import com.blog01.backend.common.ApiException;
import com.blog01.backend.post.Post;
import com.blog01.backend.post.PostRepository;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * 🔹 Like / Unlike post (toggle)
     */
    public void toggleLike(Long postId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        likeRepository.findByUserAndPost(user, post)
                .ifPresentOrElse(
                        likeRepository::delete,
                        () -> likeRepository.save(
                                PostLike.builder()
                                        .user(user)
                                        .post(post)
                                        .build()
                        )
                );
    }

    /**
     * 🔹 Count likes of post (useful for feed)
     */
    public long countLikes(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        return likeRepository.countByPost(post);
    }
}
