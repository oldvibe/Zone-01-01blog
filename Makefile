.PHONY: backend frontend dev install docker-up docker-down docker-build backend-stop

backend:
	cd backend && ./mvnw clean spring-boot:run

frontend:
	cd frontend && npx ng s

install:
	cd frontend && npm install

dev:
	@bash -c 'set -e; ROOT="$$(pwd)"; \
		if command -v lsof >/dev/null 2>&1; then \
			PID="$$(lsof -t -i:8080 2>/dev/null || true)"; \
			if [ -n "$$PID" ]; then echo "Stopping existing backend on :8080 ($$PID)"; kill $$PID; fi; \
		elif command -v fuser >/dev/null 2>&1; then \
			PID="$$(fuser -n tcp 8080 2>/dev/null | awk "{print \\$$1}" || true)"; \
			if [ -n "$$PID" ]; then echo "Stopping existing backend on :8080 ($$PID)"; kill $$PID; fi; \
		fi; \
	cd "$$ROOT/backend"; ./mvnw spring-boot:run & BACK_PID=$$!; \
	trap "kill $$BACK_PID" EXIT; \
	echo "Waiting for backend on :8080..."; \
	until [ "$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ || true)" != "000" ]; do sleep 0.5; done; \
	cd "$$ROOT/frontend"; npx ng s'

backend-stop:
	@bash -c 'if command -v lsof >/dev/null 2>&1; then \
		PID="$$(lsof -t -i:8080 2>/dev/null || true)"; \
		if [ -n "$$PID" ]; then echo "Stopping backend on :8080 ($$PID)"; kill $$PID; fi; \
	elif command -v fuser >/dev/null 2>&1; then \
		PID="$$(fuser -n tcp 8080 2>/dev/null | awk "{print \\$$1}" || true)"; \
		if [ -n "$$PID" ]; then echo "Stopping backend on :8080 ($$PID)"; kill $$PID; fi; \
	fi'

docker-build:
	docker compose build

docker-up:
	docker compose up --build

docker-down:
	docker compose down
