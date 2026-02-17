package com.blog01.backend.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.blog01.backend.user.User;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findAllByVisibleTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findAllByAuthorInAndVisibleTrueOrderByCreatedAtDesc(
            List<User> authors,
            Pageable pageable
    );

    Page<Post> findAllByAuthorNotAndVisibleTrueOrderByCreatedAtDesc(
            User author,
            Pageable pageable
    );

    Page<Post> findAllByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
}
