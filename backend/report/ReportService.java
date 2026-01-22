package com.blog01.backend.report;

import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public void report(String email, String type, Long targetId, String reason) {

        User reporter = userRepository.findByEmail(email).orElseThrow();

        reportRepository.save(
                Report.builder()
                        .reporter(reporter)
                        .targetType(type)
                        .targetId(targetId)
                        .reason(reason)
                        .build()
        );
    }

    public List<Report> pendingReports() {
        return reportRepository.findByResolvedFalse();
    }

    public void resolve(Long id) {
        Report report = reportRepository.findById(id).orElseThrow();
        report.setResolved(true);
        reportRepository.save(report);
    }
}
