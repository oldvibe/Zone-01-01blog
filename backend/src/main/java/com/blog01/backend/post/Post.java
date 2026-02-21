package com.blog01.backend.post;

import com.blog01.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection
    private List<String> mediaUrls;

    @Builder.Default
    @Column(nullable = false)
    private boolean visible = true;

    @ManyToOne
    private User author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.blog01.backend.comment.Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.blog01.backend.like.PostLike> likes;

    private LocalDateTime createdAt;
}
