package com.blog01.backend.notification;

import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyUser(User user, String message) {
        notificationRepository.save(
                Notification.builder()
                        .user(user)
                        .message(message)
                        .build()
        );
    }

    public List<Notification> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.findByUser(user);
    }
}
