.PHONY: backend frontend dev install docker-up docker-down docker-build backend-stop

backend:
	cd backend && ./mvnw clean spring-boot:run

frontend:
	cd frontend && npx ng s

install:
	cd frontend && npm install

dev:
	$(MAKE) install
	$(MAKE) backend & $(MAKE) frontend

docker-build:
	docker compose build

docker-up:
	docker compose up --build

docker-down:
	docker compose down
