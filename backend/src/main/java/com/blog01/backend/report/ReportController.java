package com.blog01.backend.report;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ReportResponse create(
            @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        return reportService.create(user.getUsername(), request);
    }
}
