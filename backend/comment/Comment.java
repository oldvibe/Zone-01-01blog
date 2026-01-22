package com.blog01.backend.comment;

import com.blog01.backend.post.Post;
import com.blog01.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @ManyToOne
    private User author;

    @ManyToOne
    private Post post;

    private LocalDateTime createdAt = LocalDateTime.now();
}
