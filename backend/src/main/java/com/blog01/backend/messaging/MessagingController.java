package com.blog01.backend.messaging;

import com.blog01.backend.messaging.dto.*;
import com.blog01.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {
    private final MessagingService messagingService;

    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations(@AuthenticationPrincipal UserPrincipal user) {
        return messagingService.getConversations(user.getId());
    }

    @GetMapping("/conversations/{convId}")
    public Page<MessageResponse> getMessages(
            @PathVariable Long convId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return messagingService.getMessages(convId, page, size);
    }

    @PostMapping("/send/{receiverId}")
    public MessageResponse sendMessage(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long receiverId,
            @RequestBody MessageRequest request
    ) {
        return messagingService.sendMessage(user.getId(), receiverId, request);
    }
}
