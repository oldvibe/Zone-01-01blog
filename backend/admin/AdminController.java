package com.blog01.backend.admin;

import com.blog01.backend.report.Report;
import com.blog01.backend.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ReportService reportService;

    @GetMapping("/reports")
    public List<Report> reports() {
        return reportService.pendingReports();
    }

    @PostMapping("/reports/{id}/resolve")
    public void resolve(@PathVariable Long id) {
        reportService.resolve(id);
    }
    // reports
    // remove report 

    // posts
    // delete and make post invisible, get all(even if invisible)

    // users
    // delete and ban user, get all(even if banned)
}
