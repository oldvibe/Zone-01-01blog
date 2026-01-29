package com.blog01.backend.user;

// Service implementation pending

import com.blog01.backend.common.ApiException;
import com.blog01.backend.user.dto.UserResponse;
import com.blog01.backend.user.dto.UpdateUserRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	private UserResponse toResponse(User u) {
		return new UserResponse(
				u.getId(),
				u.getUsername(),
				u.getEmail(),
				u.getRole() != null ? u.getRole().name() : null,
				u.isEnabled(),
				u.getCreatedAt()
		);
	}

	public UserResponse getById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		return toResponse(user);
	}

	public UserResponse getByUsername(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		return toResponse(user);
	}

	public List<UserResponse> getAllForAdmin() {
		return userRepository.findAll()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	public void ban(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		user.setEnabled(false);
		userRepository.save(user);
	}

	public void delete(Long id) {
		if (!userRepository.existsById(id)) {
			throw new ApiException(HttpStatus.NOT_FOUND, "User not found");
		}
		userRepository.deleteById(id);
	}

	public UserResponse updateProfile(Long id, UpdateUserRequest request) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

		if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
			if (userRepository.existsByUsername(request.getUsername())) {
				throw new ApiException(HttpStatus.CONFLICT, "Username already taken");
			}
			user.setUsername(request.getUsername());
		}

		if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
			if (userRepository.existsByEmail(request.getEmail())) {
				throw new ApiException(HttpStatus.CONFLICT, "Email already taken");
			}
			user.setEmail(request.getEmail());
		}

		userRepository.save(user);
		return toResponse(user);
	}
}
