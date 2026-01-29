package com.blog01.backend.report;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequest {
    private String reason;
    private String targetType;
    private Long targetId;
}
