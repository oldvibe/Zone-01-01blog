package com.blog01.backend.admin;

import com.blog01.backend.report.ReportResponse;
import com.blog01.backend.report.ReportService;
import com.blog01.backend.user.dto.UserResponse;
import com.blog01.backend.user.UserService;
import com.blog01.backend.post.dto.PostResponse;
import com.blog01.backend.post.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ReportService reportService;
    private final PostService postService;
    private final UserService userService;
    /* ================= REPORTS ================= */

    @GetMapping("/reports")
    public List<ReportResponse> reports() {
        return reportService.pendingReports();
    }

    @PostMapping("/reports/{id}/resolve")
    public void resolveReport(@PathVariable Long id) {
        reportService.resolve(id);
    }

    @DeleteMapping("/reports/{id}")
    public void deleteReport(@PathVariable Long id) {
        reportService.delete(id);
    }

    /* ================= POSTS ================= */

    @GetMapping("/posts")
    public List<PostResponse> allPosts() {
        return postService.getAllForAdmin();
    }

    @PostMapping("/posts/{id}/toggle-visibility")
    public void togglePostVisibility(@PathVariable Long id) {
        postService.toggleVisibility(id);
    }

    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable Long id) {
        postService.deleteByAdmin(id);
    }

    /* ================= USERS ================= */

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userService.getAllForAdmin();
    }

    @PostMapping("/users/{id}/toggle-ban")
    public void toggleUserBan(@PathVariable Long id) {
        userService.toggleBan(id);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
