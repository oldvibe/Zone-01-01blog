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

    @GetMapping
    public List<Notification> myNotifications(
            @AuthenticationPrincipal UserDetails user
    ) {
        return notificationService.getMyNotifications(user.getUsername());
    }

    // make notification seen
    // delete notification
    // (make all readed, remove all)(Optional not a bonus)
    // insert notification in notification service
}
