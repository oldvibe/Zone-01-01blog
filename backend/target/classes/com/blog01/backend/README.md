# 01Blog – Social Blogging Platform

01Blog is a fullstack social blogging platform built for students to share
their learning journey, interact with others, and build a collaborative community.

## Features
- Authentication (JWT)
- User profiles
- Posts with media
- Likes & comments
- Follow system
- Notifications
- Reports & admin moderation

## Tech Stack
- Java 17
- Spring Boot
- Spring Security + JWT
- PostgreSQL
- Angular
- Docker

## Run Backend
docker compose up -d
mvn spring-boot:run

## Run Frontend
npm install
ng serve



User ───< Post ───< Comment
  │        │
  │        └──< PostLike
  │
  ├──< Notification
  ├──< Report
  └──< Follow >── User

🧑 User

id (PK)

username

email

password

role

enabled

created_at

📝 Post

id (PK)

content

media_url

created_at

author_id (FK → User)

❤️ PostLike

id (PK)

user_id (FK → User)

post_id (FK → Post)

💬 Comment

id (PK)

content

created_at

author_id (FK → User)

post_id (FK → Post)

➕ Follow

id (PK)

follower_id (FK → User)

following_id (FK → User)

🔔 Notification

id (PK)

message

read

created_at

user_id (FK → User)

🚨 Report

id (PK)

target_type (POST / USER)

target_id

reason

resolved

reporter_id (FK → User)

🔗 Relations

User 1..* Post

User 1..* Comment

User 1..* PostLike

User 1..* Notification

User ↔ User (Follow)

Post 1..* Comment

Post 1..* PostLike