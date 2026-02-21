package com.blog01.backend.report;

import com.blog01.backend.common.ApiException;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import com.blog01.backend.post.PostRepository;
import com.blog01.backend.comment.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public List<ReportResponse> pendingReports() {
        return reportRepository.findByResolvedFalse()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void resolve(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setResolved(true);
        reportRepository.save(report);
    }

    public void delete(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Report not found");
        }
        reportRepository.deleteById(id);
    }

    public ReportResponse create(String reporterUsername, ReportRequest request) {
        if (request == null || request.getTargetId() == null || request.getTargetType() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid report request");
        }

        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        String targetType = request.getTargetType().toUpperCase();
        if (!targetType.equals("POST") && !targetType.equals("COMMENT") && !targetType.equals("USER")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid report target");
        }

        Report report = Report.builder()
                .reason(request.getReason())
                .targetType(targetType)
                .targetId(request.getTargetId())
                .resolved(false)
                .createdAt(java.time.LocalDateTime.now())
                .reporter(reporter)
                .build();

        Report saved = reportRepository.save(report);
        return toResponse(saved);
    }

    private ReportResponse toResponse(Report report) {
        String targetContent = null;
        String targetOwnerUsername = null;
        Long targetOwnerId = null;

        try {
            String type = report.getTargetType().toUpperCase();
            switch (type) {
                case "POST" -> {
                    var post = postRepository.findById(report.getTargetId()).orElse(null);
                    if (post != null) {
                        targetContent = post.getContent();
                        targetOwnerUsername = post.getAuthor().getUsername();
                        targetOwnerId = post.getAuthor().getId();
                    }
                }
                case "COMMENT" -> {
                    var comment = commentRepository.findById(report.getTargetId()).orElse(null);
                    if (comment != null) {
                        targetContent = comment.getContent();
                        targetOwnerUsername = comment.getAuthor().getUsername();
                        targetOwnerId = comment.getAuthor().getId();
                    }
                }
                case "USER" -> {
                    var user = userRepository.findById(report.getTargetId()).orElse(null);
                    if (user != null) {
                        targetOwnerUsername = user.getUsername();
                        targetOwnerId = user.getId();
                        targetContent = "User Profile: " + user.getUsername();
                    }
                }
            }
        } catch (Exception e) {
            // Silently fail if target not found
        }

        return ReportResponse.builder()
                .id(report.getId())
                .reason(report.getReason())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .targetOwnerId(targetOwnerId)
                .targetContent(targetContent)
                .targetOwnerUsername(targetOwnerUsername)
                .reporterUsername(report.getReporter().getUsername())
                .resolved(report.isResolved())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
