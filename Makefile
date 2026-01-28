.PHONY: backend frontend dev install

backend:
	cd backend && ./mvnw spring-boot:run

frontend:
	cd frontend && npx ng s

install:
	cd frontend && npm install

dev:
	$(MAKE) -j2 backend frontend
