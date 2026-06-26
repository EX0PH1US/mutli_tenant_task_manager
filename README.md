# Task Management REST API

A secure multi-tenant REST API for managing organisations, users, and task assignments. Built with Express, MongoDB, and JWT authentication, the API ensures complete data isolation between organisations while providing role-based access control.

---

## Features

- JWT Authentication with Access & Refresh Tokens
- Multi-tenant architecture with organisation-level data isolation
- Role-based access control (Admin & Member)
- Atomic organisation registration with automatic Admin creation
- Secure password hashing using bcrypt
- HTTP-only Refresh Token cookies
- IP and authentication rate limiting
- Paginated task retrieval
- Information leak prevention between organisations
- CRUD operations for task management

---

## Tech Stack

- JavaScript
- Express.js
- MongoDB
- JSON Web Token (JWT)
- Helmet
- Express Rate Limit
- JSON

---

## Authentication

### Register Organisation

Creates a new organisation and registers its first user as an **Admin** in a single atomic operation.

```http
POST /register/org
```

#### Request Body

```json
{
  "email": "admin@example.com",
  "name": "John Doe",
  "password": "password",
  "orgName": "Acme Inc"
}
```

---

### Register Staff

Registers a new member into an existing organisation.

```http
POST /register/staff
```

#### Request Body

```json
{
  "email": "member@example.com",
  "name": "Jane Doe",
  "password": "password",
  "orgId": "...",
  "orgSlug": "acme-inc"
}
```

> Either `orgId` or `orgSlug` is required.

---

### Login

Authenticates a user and generates:

- Access Token (Expires in **10 minutes**)
- Refresh Token (Expires in **7 days**)

The Refresh Token is stored in the database and sent as an **HTTP-only cookie**.

```http
POST /login
```

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

---

### Refresh Access Token

Generates a new Access Token using the Refresh Token stored in the HTTP-only cookie.

```http
POST /refresh
```

---

### Logout

Invalidates the Refresh Token and clears the cookie.

```http
POST /logout
```

---

## Task Routes

> All task routes require a valid JWT Access Token.

### Create Task

```http
POST /tasks/add
```

```json
{
  "title": "Complete API",
  "body": "Finish documentation",
  "assignedTo": "<userId>"
}
```

---

### Edit Task

```http
PUT /tasks/edit/:id
```

```json
{
  "title": "Updated Title",
  "body": "Updated Body",
  "assignedTo": "<userId>"
}
```

---

### Delete Task

```http
DELETE /tasks/:id
```

Permissions:

- Admins can delete any task within their organisation.
- Members can delete only the tasks they created.

---

### Get All Tasks

```http
GET /tasks/all
```

Supports pagination.

Example:

```http
GET /tasks/all?page=2&limit=4
```

---

### Get My Tasks

Returns tasks assigned to the authenticated user.

```http
GET /tasks/my
```

Supports pagination.

---

## Data Models

### Organisation

| Field | Type |
|------|------|
| name | String |
| slug | String (Unique) |

---

### User

| Field | Type |
|------|------|
| email | String (Unique) |
| password | String (Hashed) |
| name | String |
| organisation | ObjectId (Organisation) |

---

### Task

| Field | Type |
|------|------|
| title | String |
| body | String |
| assignedTo | ObjectId (User) |
| assignedBy | ObjectId (User) |
| completed | Boolean |
| orgId | ObjectId (Organisation) |

---

## Security

- Passwords are hashed using **bcrypt**
- JWT-based authentication
- HTTP-only Refresh Token cookies
- Organisation-level query isolation
- Role-based authorization
- Helmet security headers
- IP and authentication rate limiting

Every authenticated request contains the user's organisation ID within the JWT payload. The API automatically injects this organisation ID into database queries, ensuring resources belonging to one organisation cannot be accessed by another.

---

## Rate Limits

### General API

- **250 requests**
- Per **15 minutes**
- Per IP Address

### Authentication Endpoints

- **50 requests**
- Per **2 hours**
- Per IP Address + Email

---

## JWT Payload

The Access Token contains:

- User ID
- Email
- Name
- Role
- Organisation ID

---

## Pagination

Supported on all task retrieval endpoints.

Example:

```http
GET /tasks/all?page=2&limit=4
```

Parameters:

| Parameter | Default |
|----------|---------|
| page | 1 |
| limit | 5 |

---

## License

This project is licensed under the MIT License.
