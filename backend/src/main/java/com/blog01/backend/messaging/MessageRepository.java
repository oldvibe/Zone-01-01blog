package com.blog01.backend.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findAllByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
}
