package com.blog01.backend.post;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.blog01.backend.post.dto.PostRequest;
import com.blog01.backend.post.dto.PostResponse;
import com.blog01.backend.security.UserPrincipal;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public Page<Post> getFeed(UserPrincipal user, int page, int size) {
        return postRepository.findAll(
                PageRequest.of(page, size)
        );
    }

    public List<PostResponse> getAllForAdmin() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllForAdmin'");
    }

    public void setInvisible(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setInvisible'");
    }

    public void delete(Long id, Long long1) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'delete'");
    }

    public PostResponse update(Long id, Long id2, PostRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'update'");
    }

    public PostResponse create(Long id, PostRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'create'");
    }

    public Page<PostResponse> getSubscriptionsFeed(Long id, int page, int size) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getSubscriptionsFeed'");
    }
}
