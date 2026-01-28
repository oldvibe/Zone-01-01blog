package com.blog01.backend.post;

import com.blog01.backend.like.PostLikeRepository;
import com.blog01.backend.post.dto.PostResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostMapper {

    private final PostLikeRepository likeRepository;

    public PostResponse toDto(Post post) {
        return new PostResponse(
                post.getId(),
                post.getContent(),
                post.getAuthor().getUsername(),
                null, null, post.getCreatedAt(),
                likeRepository.countByPost(post), false, false
        );
    }
}
