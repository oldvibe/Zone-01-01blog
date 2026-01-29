package com.blog01.backend.post;

import com.blog01.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String mediaUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean visible = true;

    @ManyToOne
    private User author;

    private LocalDateTime createdAt;
}
