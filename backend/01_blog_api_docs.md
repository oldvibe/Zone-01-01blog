# Blog Backend API Documentation

A comprehensive REST API for a blog platform with authentication, posts, comments, likes, follows, notifications, and admin features.

---

## 🔐 Authentication

### Register
Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "john",
  "email": "john@mail.com",
  "password": "password123"
}
```

**Response:**
- Status: `201 Created`
- Body: Empty

---

### Login
Authenticates a user and returns a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here"
}
```

---

## 📝 Posts

### Get Public Feed
Retrieves paginated public posts.

**Endpoint:** `GET /api/posts`

**Query Parameters:**
- `page` (optional, default: `0`)
- `size` (optional, default: `10`)

**Authentication:** Required 🔒

---

### Get Subscriptions Feed
Retrieves posts from followed users.

**Endpoint:** `GET /api/posts/subscriptions`

**Authentication:** Required 🔒

---

### Create Post
Creates a new blog post.

**Endpoint:** `POST /api/posts`

**Authentication:** Required 🔒

**Request Body:**
```json
{
  "content": "Hello world!",
  "mediaUrl": "image.png"
}
```

---

### Update Post
Updates an existing post.

**Endpoint:** `PUT /api/posts/{id}`

**Authentication:** Required 🔒 (owner only)

**Request Body:**
```json
{
  "content": "Updated content here",
  "mediaUrl": "updated-image.png"
}
```

---

### Delete Post
Deletes a post.

**Endpoint:** `DELETE /api/posts/{id}`

**Authentication:** Required 🔒 (owner only)

---

## 💬 Comments

### Get Comments of a Post
Retrieves all comments for a specific post.

**Endpoint:** `GET /api/posts/{postId}/comments`

**Authentication:** Required 🔒

---

### Add Comment
Adds a comment to a post.

**Endpoint:** `POST /api/posts/{postId}/comments`

**Authentication:** Required 🔒

**Request Body:**
```json
{
  "content": "Nice post!"
}
```

---

### Delete Comment
Deletes a comment.

**Endpoint:** `DELETE /api/posts/comments/{commentId}`

**Authentication:** Required 🔒 (owner or admin)

---

## ❤️ Likes

### Like / Unlike Post
Toggles like status on a post.

**Endpoint:** `POST /api/posts/{postId}/like`

**Authentication:** Required 🔒

---

## 👤 Follow System

### Follow / Unfollow User
Toggles follow status for a user.

**Endpoint:** `POST /api/users/{userId}/follow`

**Authentication:** Required 🔒

---

### My Following
Retrieves list of users you are following.

**Endpoint:** `GET /api/users/me/following`

**Authentication:** Required 🔒

---

### My Followers
Retrieves list of your followers.

**Endpoint:** `GET /api/users/me/followers`

**Authentication:** Required 🔒

---

## 🔔 Notifications

### Get My Notifications
Retrieves your notifications.

**Endpoint:** `GET /api/notifications`

**Authentication:** Required 🔒

---

### Mark Notification as Read
Marks a notification as read.

**Endpoint:** `POST /api/notifications/{id}/read`

**Authentication:** Required 🔒

---

## 📁 File Upload

### Upload File
Uploads a file to the server.

**Endpoint:** `POST /api/files`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` → binary file

**Response:**
```
uploaded_filename.png
```

---

## 🛡️ Admin

**Authentication:** Required 🔒 (ADMIN role)

### Reports

#### Get All Reports
**Endpoint:** `GET /api/admin/reports`

#### Resolve Report
**Endpoint:** `POST /api/admin/reports/{id}/resolve`

#### Delete Report
**Endpoint:** `DELETE /api/admin/reports/{id}`

---

### Posts Management

#### Get All Posts
**Endpoint:** `GET /api/admin/posts`

#### Hide Post
**Endpoint:** `POST /api/admin/posts/{id}/hide`

#### Delete Post
**Endpoint:** `DELETE /api/admin/posts/{id}`

---

### User Management

#### Get All Users
**Endpoint:** `GET /api/admin/users`

#### Ban User
**Endpoint:** `POST /api/admin/users/{id}/ban`

---

## 📋 Notes

- All authenticated endpoints require a valid JWT token in the `Authorization` header: `Bearer {token}`
- Responses follow standard HTTP status codes
- All request/response bodies use JSON format except file uploads

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies
3. Configure your database
4. Run the application
5. Use the endpoints documented above

---

## 📄 License

This project is licensed under the MIT License.
