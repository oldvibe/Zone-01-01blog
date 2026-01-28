package com.blog01.backend.report;

import com.blog01.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reason;

    private String targetType;

    private Long targetId;

    private boolean resolved;

    private LocalDateTime createdAt;

    @ManyToOne
    private User reporter;
}
