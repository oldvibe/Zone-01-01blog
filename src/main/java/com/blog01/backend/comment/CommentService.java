package com.blog01.backend.comment;

import com.blog01.backend.post.Post;
import com.blog01.backend.post.PostRepository;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * 🔹 Get comments of post
     */
    public List<CommentResponse> getComments(Long postId, String email) {

        User currentUser = userRepository.findByEmail(email).orElseThrow();

        return commentRepository.findAllByPostId(postId)
                .stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getAuthor().getId().equals(currentUser.getId())
                ))
                .collect(Collectors.toList());
    }

    /**
     * 🔹 Add comment
     */
    public CommentResponse addComment(Long postId, String content, String email) {

        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        Comment comment = Comment.builder()
                .content(content)
                .author(user)
                .post(post)
                .build();

        commentRepository.save(comment);

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                true
        );
    }

    /**
     * 🔹 Delete comment (owner or admin)
     */
    public void deleteComment(Long commentId, String email) {

        User user = userRepository.findByEmail(email).orElseThrow();
        Comment comment = commentRepository.findById(commentId).orElseThrow();

        boolean isOwner = comment.getAuthor().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
