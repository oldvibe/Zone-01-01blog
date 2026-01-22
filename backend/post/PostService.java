package com.blog01.backend.post;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public Page<Post> getFeed(int page, int size) {
        return postRepository.findAll(
                PageRequest.of(page, size)
        );
    }
}
