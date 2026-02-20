# AnimeBlog - Social Blogging Platform for Students

AnimeBlog is a fullstack social blogging platform designed for students to share their learning experiences, discoveries, and progress. Built with **Java Spring Boot** and **Angular**, it follows a clean RESTful architecture and provides a secure, interactive environment for knowledge sharing.

## 🚀 Getting Started

### Prerequisites
- **Docker** & **Docker Compose**
- **Java 17** (for local backend development)
- **Node.js 20+** (for local frontend development)

### Running with Docker (Recommended)
The easiest way to start the entire stack (Frontend, Backend, and Database) is using Docker Compose:

```bash
docker-compose up --build
```
- **Frontend:** [http://localhost:4200](http://localhost:4200)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Database:** PostgreSQL on port 5432

---

## 🛠 Technologies Used

### Backend
- **Java 17** with **Spring Boot 3**
- **Spring Security** & **JWT** for secure authentication
- **Spring Data JPA** for database interaction
- **PostgreSQL** as the relational database
- **Hibernate** for ORM
- **Lombok** for clean boilerplate-free code

### Frontend
- **Angular 21** (Standalone Components)
- **Bootstrap 5** for responsive UI
- **RxJS** for reactive programming
- **TypeScript**

---

## 🌟 Key Features

### For Students
- **Authentication:** Secure registration and login using JWT.
- **Personal Block:** A public profile page showcasing all your posts.
- **Feed:** A home screen displaying posts from users you subscribe to.
- **Post Interaction:** Create, edit, and delete posts with text and media (images/videos).
- **Social Engagement:** Like and comment on peers' posts.
- **Subscriptions:** Follow other students to stay updated on their journey.
- **Notifications:** Real-time updates when subscribed authors post new content.
- **Reporting:** Flag inappropriate content for moderation.

### For Administrators
- **Moderation Panel:** Manage all users and posts across the platform.
- **Report Handling:** Review student reports and take action (delete posts or ban users).
- **Role-Based Access:** Protected routes ensuring only authorized admins can access moderation tools.

---

## 📁 Project Structure

```text
.
├── backend/            # Spring Boot Application
│   ├── src/            # Java source code
│   └── pom.xml         # Maven dependencies
├── frontend/           # Angular Application
│   ├── src/            # Angular components and services
│   └── package.json    # NPM dependencies
└── docker-compose.yml  # Container orchestration
```

## 🔐 Security & Roles
- **ROLE_USER:** Can post, like, comment, follow, and report.
- **ROLE_ADMIN:** Has full access to the Admin Dashboard and moderation tools.
- **JWT:** Tokens are passed in the `Authorization` header for all protected API calls.

---
Built for Zone01 Oujda Students.
