package com.blog01.backend.report;

import com.blog01.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User reporter;

    private String targetType; // POST or USER

    private Long targetId;

    private String reason;

    private boolean resolved = false;
}
