package com.blog01.backend.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 🔹 Get my notifications
     */
    @GetMapping
    public List<NotificationResponse> myNotifications(
            @AuthenticationPrincipal UserDetails user) {
        return notificationService.getMyNotifications(user.getUsername());
    }

    @GetMapping("/unread-count")
    public long unreadCount(@AuthenticationPrincipal UserDetails user) {
        return notificationService.countUnread(user.getUsername());
    }

    /**
     * 🔹 Mark notification as read
     */
    @PostMapping("/{id}/read")
    public void markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        notificationService.markAsRead(id, user.getUsername());
    }

    /**
     * 🔹 Mark notification as unread
     */
    @PostMapping("/{id}/unread")
    public void markAsUnread(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        notificationService.markAsUnread(id, user.getUsername());
    }

    /**
     * 🔹 Mark all notifications as read
     */
    @PostMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal UserDetails user) {
        notificationService.markAllAsRead(user.getUsername());
    }
}
