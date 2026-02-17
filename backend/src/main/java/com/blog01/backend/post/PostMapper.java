package com.blog01.backend.post;

import com.blog01.backend.like.PostLikeRepository;
import com.blog01.backend.post.dto.PostResponse;
import com.blog01.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostMapper {

    private final PostLikeRepository likeRepository;

    public PostResponse toDto(Post post, User currentUser) {
        boolean likedByMe = false;
        boolean mine = false;

        if (currentUser != null && post.getAuthor() != null) {
            likedByMe = likeRepository.findByUserAndPost(currentUser, post).isPresent();
            mine = post.getAuthor().getId().equals(currentUser.getId());
        }

        Long authorId = post.getAuthor() != null ? post.getAuthor().getId() : null;
        String authorUsername = post.getAuthor() != null ? post.getAuthor().getUsername() : null;

        return new PostResponse(
                post.getId(),
                post.getContent(),
                post.getMediaUrls(),
                authorId,
                authorUsername,
                post.getCreatedAt(),
                likeRepository.countByPost(post),
                likedByMe,
                mine
        );
    }
}
