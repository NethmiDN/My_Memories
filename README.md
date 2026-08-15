# My Memories - React Microservices Web Application

A complete Polyrepo-ready Microservices Web Application built with **Spring Boot 3.4**, **Spring Cloud (Gateway & Eureka)**, **MySQL**, **MongoDB**, **Google Cloud Storage SDK**, and a **React 18 + Vite Single Page Application (SPA)**.

---

## 🏗 Microservices & React System Architecture

```
                       ┌─────────────────────────┐
                       │    React.js SPA UI      │
                       │ (Vite / React 18 / CSS) │
                       └────────────┬────────────┘
                                    │ HTTP Requests (Axios)
                                    ▼
                       ┌─────────────────────────┐
                       │   API GATEWAY (:8080)   │
                       │ (Spring Cloud Gateway)  │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │ (Dynamic Routing via Eureka Service Discovery)       │
         ▼                          ▼                          ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  user-service   │       │  event-service  │       │  media-service  │
│     (:8081)     │       │     (:8082)     │       │     (:8083)     │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         ▼                         ▼                         ▼
  MySQL Database           MongoDB Database          Google Cloud Storage
   (users_db)               (memories_db)            Bucket / Local Disk
```

---

## 📦 Service Breakdown & Ports

| Module | Service Name | Port | Database / Storage | Tech Stack |
| :--- | :--- | :--- | :--- | :--- |
| `eureka_server` | Eureka Registry | `8761` | In-Memory Registry | Spring Cloud Eureka Server |
| `api-gateway` | API Gateway | `8080` | Dynamic Routing / CORS | Spring Cloud Gateway |
| `user-service` | User Service | `8081` | MySQL (`users_db`) | Spring Boot Data JPA |
| `event-service` | Event Service | `8082` | MongoDB (`memories_db`) | Spring Boot Data MongoDB |
| `media-service` | Media Service | `8083` | GCP Cloud Storage Bucket | `com.google.cloud:google-cloud-storage` |
| `frontend` | React Web UI SPA | `3000` | Consumes Gateway `:8080` | React 18, Vite, Lucide Icons, Axios |

---

## 🚀 How to Run Locally

### Option 1: Using Docker Compose
Run the entire architecture (MySQL, MongoDB, Eureka, Gateway, Microservices, and React Frontend) with a single command:
```bash
docker-compose up --build
```

### Option 2: Running React Frontend Standalone
1. **Navigate to `frontend/`**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. **Open in Browser**:
   Navigate to `http://localhost:3000`.

---

## 📡 Microservices API Routes (`http://localhost:8080`)

- **User Service Routes**: `/api/users/**` -> `lb://user-service`
  - `GET /api/users`: Retrieve all user profiles.
  - `POST /api/users`: Create a new user profile in MySQL.

- **Event Service Routes**: `/api/events/**` -> `lb://event-service`
  - `GET /api/events`: Retrieve all memory events in MongoDB.
  - `POST /api/events`: Create a memory event.
  - `PATCH /api/events/{id}/images`: Attach image URL to memory event.

- **Media Service Routes**: `/api/media/**` -> `lb://media-service`
  - `POST /api/media/upload`: Upload image multipart file to Google Cloud Storage (returns public URL).
