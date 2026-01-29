# 01Blog

A social blogging platform for students to share learning progress, follow each other, and discuss posts.

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, H2 (dev), PostgreSQL (prod-ready)
- Frontend: Angular, TypeScript, SCSS, Bootstrap 5

## Features

- Auth: register/login with JWT and role-based access (user/admin)
- Feed: public + subscriptions feeds
- Posts: create/update/delete with media (image/video) upload
- Interactions: likes, comments, follow/unfollow
- Notifications: unread count + read status
- Reports: report posts/comments/users with reason; admin moderation
- Admin: manage users, posts, and reports

## Project Structure

```
backend/   Spring Boot API
frontend/  Angular app
```

## How to Run (Local)

### Backend

```
cd backend
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`.

### Frontend

```
cd frontend
npm install
npx ng serve
```

Frontend runs on `http://localhost:4200`.

### Run Both (Makefile)

```
make dev
```

### Tests

Backend tests:

```
cd backend
./mvnw test
```

## Notes

- Uploaded media is stored in `backend/uploads/` and served under `/uploads/**`.
- For production, configure a persistent database and storage (e.g., PostgreSQL + S3/local volume).

