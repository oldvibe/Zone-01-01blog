.PHONY: run clean fclean re backend-dev frontend-dev install

# Default target to run the entire project using Docker
run: docker-up

docker-up:
	docker compose up --build

# Stop and remove containers and networks
clean: docker-down

docker-down:
	docker compose down

# Stop and remove containers, networks, and volumes
fclean:
	docker compose down -v

# Rebuild and run
re: fclean run

# --- Local Development Helpers (Non-Docker) ---

# Install dependencies
install:
	cd frontend && npm install

# Run backend locally (requires a running postgres database)
backend-dev:
	cd backend && ./mvnw spring-boot:run

# Run frontend locally
frontend-dev:
	cd frontend && npm start
