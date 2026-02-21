package com.blog01.backend.notification;

import com.blog01.backend.common.ApiException;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;

        /**
         * 🔹 Create notification
         */
        public void notifyUser(User user, String message) {
                notificationRepository.save(
                                Notification.builder()
                                                .user(user)
                                                .message(message)
                                                .read(false)
                                                .createdAt(java.time.LocalDateTime.now())
                                                .build());
        }

        /**
         * 🔹 Get my notifications
         */
        public List<NotificationResponse> getMyNotifications(String username) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

                return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                                .stream()
                                .map(n -> new NotificationResponse(
                                                n.getId(),
                                                n.getMessage(),
                                                n.isRead(),
                                                n.getCreatedAt()))
                                .toList();
        }

        public long countUnread(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
                return notificationRepository.countByUserAndReadFalse(user);
        }

        /**
         * 🔹 Mark notification as read
         */
        public void markAsRead(Long notificationId, String username) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));

                if (!notification.getUser().getId().equals(user.getId())) {
                        throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed");
                }

                notification.setRead(true);
                notificationRepository.save(notification);
        }

        /**
         * 🔹 Mark notification as unread
         */
        public void markAsUnread(Long notificationId, String username) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));

                if (!notification.getUser().getId().equals(user.getId())) {
                        throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed");
                }

                notification.setRead(false);
                notificationRepository.save(notification);
        }

        /**
         * 🔹 Mark all notifications as read
         */
        public void markAllAsRead(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

                List<Notification> notifications = notificationRepository.findByUserAndReadFalse(user);
                notifications.forEach(n -> n.setRead(true));
                notificationRepository.saveAll(notifications);
        }
}
