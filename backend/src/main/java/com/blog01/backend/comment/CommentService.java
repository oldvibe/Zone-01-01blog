package com.blog01.backend.comment;

import com.blog01.backend.common.ApiException;
import com.blog01.backend.post.Post;
import com.blog01.backend.post.PostRepository;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * 🔹 Get comments of post
     */
    public List<CommentResponse> getComments(Long postId, String username) {

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return commentRepository.findAllByPostId(postId)
                .stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getAuthor().getUsername(),
                        comment.getAuthor().getId().equals(currentUser.getId()),
                        comment.getCreatedAt(),
                        comment.getParent() != null ? comment.getParent().getId() : null
                ))
                .toList();
    }

    /**
     * 🔹 Add comment
     */
        public CommentResponse addComment(Long postId, String content, Long parentId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        Comment parent = null;
        if (parentId != null) {
            parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .content(content)
                .author(user)
                .post(post)
                .parent(parent)
                .createdAt(LocalDateTime.now())
                .build();

        commentRepository.save(comment);

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                user.getUsername(),
                true,
                comment.getCreatedAt(),
                parentId
        );
    }

    /**
     * 🔹 Delete comment (owner or admin)
     */
    public void deleteComment(Long commentId, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));

        boolean isOwner = comment.getAuthor().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
