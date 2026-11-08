# CampusConnect API Specification (v1)

Base URL: `http://localhost:3000/api/v1`

## 1. Required Auth & Health Endpoints

| Method | Endpoint | Purpose | Success Code | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Check if the backend server is running | `200 OK` | `500` |
| `POST` | `/api/v1/sessions` | Authenticate user credentials and return a JWT | `200 OK` | `400`, `401`, `500` |
| `GET` | `/api/v1/users/me` | Get the profile of the currently signed-in user | `200 OK` | `401`, `500` |

### Health Check — `GET /api/v1/health`
**Response (`200 OK`):**
```json
{
  "status": "ok"
}
```

### Sign In — `POST /api/v1/sessions`
**Request Body:**
```json
{
  "email": "student@campusconnect.test",
  "password": "Campus26"
}
```

**Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Demo Student",
    "email": "student@campusconnect.test"
  }
}
```

**Error Responses:**
* **`400 Bad Request`** (missing email or password):
  ```json
  {
    "error": "Email and password are required."
  }
  ```
* **`401 Unauthorized`** (wrong email or password):
  ```json
  {
    "error": "Invalid email or password."
  }
  ```

### Current User Profile — `GET /api/v1/users/me`
**Request Header:**
`Authorization: Bearer <token>`

**Response (`200 OK`):**
```json
{
  "id": 1,
  "name": "Demo Student",
  "email": "student@campusconnect.test"
}
```

**Error Response (`401 Unauthorized`):**
```json
{
  "error": "Not logged in."
}
```

---

## Events (design only)

The following REST endpoints follow Week 12 conventions for managing school events on CampusConnect (designed on paper only; not built in the backend):

| Method | Endpoint | Purpose | Success Code | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | List all campus events | `200 OK` | `500` |
| `GET` | `/api/v1/events?month=11` | Filter campus events by month (e.g., November) | `200 OK` | `400`, `500` |
| `GET` | `/api/v1/events/:id` | Get a single campus event by its ID | `200 OK` | `404`, `500` |
| `POST` | `/api/v1/events` | Add a new campus event | `201 Created` | `400`, `401`, `500` |
| `PATCH` | `/api/v1/events/:id` | Change part of an existing event (e.g., date or venue) | `200 OK` | `400`, `401`, `404`, `500` |
| `DELETE` | `/api/v1/events/:id` | Delete a single campus event by its ID | `204 No Content` | `401`, `404`, `500` |

### Example Event Object (`200 OK` / `201 Created`)
```json
{
  "id": 101,
  "title": "CBIT Tech Week Symposium",
  "organization": "MSU-Naawan CBIT",
  "date": "2026-11-20T09:00:00Z",
  "location": "University Auditorium"
}
```