package com.blog01.backend.messaging;

import com.blog01.backend.common.ApiException;
import com.blog01.backend.messaging.dto.*;
import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessagingService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<ConversationResponse> getConversations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return conversationRepository.findAllByUser1OrUser2OrderByLastMessageAtDesc(user, user)
                .stream()
                .map(c -> {
                    User other = c.getUser1().getId().equals(userId) ? c.getUser2() : c.getUser1();
                    return new ConversationResponse(c.getId(), other.getId(), other.getUsername(), c.getLastMessageAt());
                })
                .toList();
    }

    public Page<MessageResponse> getMessages(Long conversationId, int page, int size) {
        return messageRepository.findAllByConversationIdOrderByCreatedAtDesc(conversationId, PageRequest.of(page, size))
                .map(m -> new MessageResponse(m.getId(), m.getSender().getId(), m.getSender().getUsername(), m.getContent(), m.getCreatedAt()));
    }

    public MessageResponse sendMessage(Long senderId, Long receiverId, MessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Receiver not found"));

        Conversation conv = conversationRepository.findBetween(sender, receiver)
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .user1(sender).user2(receiver).lastMessageAt(LocalDateTime.now()).build()));

        Message msg = Message.builder()
                .conversation(conv)
                .sender(sender)
                .content(request.content())
                .createdAt(LocalDateTime.now())
                .build();

        conv.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conv);
        Message saved = messageRepository.save(msg);

        return new MessageResponse(saved.getId(), senderId, sender.getUsername(), saved.getContent(), saved.getCreatedAt());
    }
}
