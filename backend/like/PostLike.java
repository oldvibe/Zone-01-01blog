package com.blog01.backend.like;

import com.blog01.backend.post.Post;
import com.blog01.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"})
)
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Post post;
}
