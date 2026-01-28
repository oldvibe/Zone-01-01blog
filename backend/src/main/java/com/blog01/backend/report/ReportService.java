package com.blog01.backend.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public List<ReportResponse> pendingReports() {
        return reportRepository.findByResolvedFalse()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void resolve(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow();
        report.setResolved(true);
        reportRepository.save(report);
    }

    public void delete(Long id) {
        reportRepository.deleteById(id);
    }

    private ReportResponse toResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reason(report.getReason())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reporterUsername(report.getReporter().getUsername())
                .resolved(report.isResolved())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
