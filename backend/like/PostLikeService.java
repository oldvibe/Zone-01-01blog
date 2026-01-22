package com.blog01.backend.like;

import com.blog01.backend.post.Post;
import com.blog01.backend.post.PostRepository;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public void toggleLike(Long postId, String email) {

        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

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
}
