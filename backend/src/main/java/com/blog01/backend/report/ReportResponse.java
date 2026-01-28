package com.blog01.backend.report;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {

    private Long id;

    private String reason;

    private String targetType; // POST / COMMENT / USER

    private Long targetId;

    private String reporterUsername;

    private boolean resolved;

    private LocalDateTime createdAt;
}
