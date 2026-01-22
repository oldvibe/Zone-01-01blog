package com.blog01.backend.comment;

import com.blog01.backend.post.Post;
import com.blog01.backend.post.PostRepository;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public void addComment(Long postId, String content, String email) {

        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        Comment comment = Comment.builder()
                .content(content)
                .author(user)
                .post(post)
                .build();

        commentRepository.save(comment);
    }
}
