package com.blog01.backend.post;

import com.blog01.backend.common.ApiException;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.blog01.backend.follow.FollowRepository;
import com.blog01.backend.notification.NotificationService;
import com.blog01.backend.post.dto.PostRequest;
import com.blog01.backend.post.dto.PostResponse;
import com.blog01.backend.security.UserPrincipal;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostMapper postMapper;
    private final NotificationService notificationService;

    public Page<PostResponse> getFeed(UserPrincipal user, int page, int size) {
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return postRepository.findAllByVisibleTrueOrderByCreatedAtDesc(
                        PageRequest.of(page, size))
                .map(post -> postMapper.toDto(post, currentUser));
    }

    public PostResponse getById(UserPrincipal user, Long postId) {
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
        return postMapper.toDto(post, currentUser);
    }

    public List<PostResponse> getAllForAdmin() {
        return postRepository.findAllByOrderByCreatedAtDesc(Pageable.unpaged())
                .stream()
                .map(post -> postMapper.toDto(post, null))
                .toList();
    }

    public void setInvisible(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
        post.setVisible(false);
        postRepository.save(post);
    }

    public void delete(Long postId, Long requesterId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isOwner = post.getAuthor() != null
                && post.getAuthor().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() != null
                && requester.getRole().name().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this post");
        }

        postRepository.delete(post);
    }

    public PostResponse update(Long postId, Long requesterId, PostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isOwner = post.getAuthor() != null
                && post.getAuthor().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() != null
                && requester.getRole().name().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to update this post");
        }

        post.setContent(request.content());
        post.setMediaUrl(request.mediaUrl());
        postRepository.save(post);

        return postMapper.toDto(post, requester);
    }

    public PostResponse create(Long id, PostRequest request) {
        if (id == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = Post.builder()
                .content(request.content())
                .mediaUrl(request.mediaUrl())
                .author(user)
                .createdAt(java.time.LocalDateTime.now())
                .visible(true)
                .build();

        Post saved = postRepository.save(post);

        followRepository.findAllByFollowing(user).forEach(follow -> {
            User follower = follow.getFollower();
            if (follower != null) {
                notificationService.notifyUser(
                        follower,
                        user.getUsername() + " posted a new update"
                );
            }
        });

        return postMapper.toDto(saved, user);
    }

    public Page<PostResponse> getSubscriptionsFeed(Long id, int page, int size) {
        User currentUser = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        List<User> following = followRepository.findAllByFollower(currentUser)
                .stream()
                .map(follow -> follow.getFollowing())
                .collect(Collectors.toList());

        if (following.isEmpty()) {
            return Page.empty(PageRequest.of(page, size));
        }

        return postRepository.findAllByAuthorInAndVisibleTrueOrderByCreatedAtDesc(
                        following,
                        PageRequest.of(page, size))
                .map(post -> postMapper.toDto(post, currentUser));
    }

    public Page<PostResponse> getPostsByAuthor(Long authorId, int page, int size) {
        User currentUser = userRepository.findById(authorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return postRepository.findAllByAuthorIdOrderByCreatedAtDesc(
                        authorId,
                        PageRequest.of(page, size))
                .map(post -> postMapper.toDto(post, currentUser));
    }

    public Page<PostResponse> getPostsByUsername(String username, int page, int size) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return postRepository.findAllByAuthorIdOrderByCreatedAtDesc(
                        author.getId(),
                        PageRequest.of(page, size))
                .map(post -> postMapper.toDto(post, author));
    }

    public void deleteByAdmin(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Post not found");
        }
        postRepository.deleteById(postId);
    }
}
