package com.blog01.backend.user;

// Service implementation pending

import com.blog01.backend.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	public List<UserResponse> getAllForAdmin() {
		return userRepository.findAll()
				.stream()
				.map(u -> new UserResponse(
						u.getId(),
						u.getUsername(),
						u.getEmail(),
						u.getRole() != null ? u.getRole().name() : null,
						u.isEnabled(),
						u.getCreatedAt()
				))
				.toList();
	}

	public void ban(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found"));
		user.setEnabled(false);
		userRepository.save(user);
	}

	public void delete(Long id) {
		if (!userRepository.existsById(id)) {
			throw new RuntimeException("User not found");
		}
		userRepository.deleteById(id);
	}
}