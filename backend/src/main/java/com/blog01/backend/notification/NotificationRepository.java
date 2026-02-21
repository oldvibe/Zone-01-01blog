package com.blog01.backend.notification;

import com.blog01.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndReadFalse(User user);

    long countByUserAndReadFalse(User user);
}
