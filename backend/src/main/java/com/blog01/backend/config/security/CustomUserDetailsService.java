package com.blog01.backend.config.security;

import com.blog01.backend.user.User;
import com.blog01.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrId)
            throws UsernameNotFoundException {

        User user;
        try {
            // Try parsing as ID first (since JWT subject is ID)
            Long id = Long.parseLong(usernameOrId);
            user = userRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        } catch (NumberFormatException e) {
            // Fallback to username
            user = userRepository.findByUsername(usernameOrId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + usernameOrId));
        }

        var authorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()));

        return new com.blog01.backend.security.UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                authorities,
                user.isEnabled()
        );
    }
}
