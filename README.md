# ☁️ My Memories — Cloud Microservices & React SPA Platform

<div align="center">

![Java 21](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2024.0.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![GCP Storage](https://img.shields.io/badge/Google_Cloud-Storage_SDK-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <b>A state-of-the-art Polyrepo-ready Microservices Web Application for logging personal memories, uploading media to Google Cloud Storage, and managing profiles.</b>
</p>

[Architecture](#-system-architecture) • [Features](#-key-features) • [Services](#-microservices--ports) • [Quickstart](#-getting-started) • [API Routes](#-api-endpoints)

</div>

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        UI["⚛️ React 18 SPA UI (:3000)<br/>Vite / Lucide Icons / Glassmorphism"]
    end

    subgraph ServiceMesh ["Spring Cloud Mesh Layer"]
        GW["🌐 API Gateway (:8080)<br/>Spring Cloud Gateway + Dynamic CORS"]
        EUREKA["🔍 Eureka Service Registry (:8761)<br/>Spring Cloud Netflix Eureka"]
        CFG["⚙️ Config Server (:8888)<br/>Spring Cloud Config (Native Profile)"]
    end

    subgraph Microservices ["Business Microservices Layer"]
        US["👤 user-service (:8081)<br/>Spring Data JPA"]
        ES["📅 event-service (:8082)<br/>Spring Data MongoDB"]
        MS["🖼️ media-service (:8083)<br/>GCP Cloud Storage SDK"]
    end

    subgraph DataStores ["Data & Cloud Storage Layer"]
        MYSQL[("🛢️ MySQL 8.0<br/>users_db")]
        MONGO[("🍃 MongoDB 7.0<br/>memories_db")]
        GCP[("☁️ GCP Bucket / Local Fallback<br/>my-memories-media-bucket")]
    end

    UI -->|HTTP REST / Axios| GW
    GW <-->|Service Discovery| EUREKA
    US <-->|Registry Check| EUREKA
    ES <-->|Registry Check| EUREKA
    MS <-->|Registry Check| EUREKA
    CFG <-->|Registry Check| EUREKA

    US -->|Fetch Central Config| CFG
    ES -->|Fetch Central Config| CFG
    MS -->|Fetch Central Config| CFG
    GW -->|Fetch Central Config| CFG

    GW -->|/api/users/**| US
    GW -->|/api/events/**| ES
    GW -->|/api/media/**| MS

    US --> MYSQL
    ES --> MONGO
    MS --> GCP
```

---

## ✨ Key Features

| Feature | Description | Tech Stack |
| :--- | :--- | :--- |
| **🔒 Auth Barrier & Session** | Protected Sign In & Sign Up pages. Dashboard unlocks only for authenticated sessions. | React State, LocalStorage, MySQL User Query |
| **👤 User Profile Management** | Full user registration & listing managed by MySQL Relational Database. | Spring Data JPA, MySQL 8.0 |
| **📅 Complete Events CRUD** | Full Create, Read, Update (Edit Modal), and Delete operations for memory events. | Spring Data MongoDB, MongoRepository |
| **☁️ GCP Media Uploader** | Multipart image file uploader backed by Google Cloud Storage SDK + local disk fallback. | `com.google.cloud:google-cloud-storage` |
| **🌐 Dynamic Routing & CORS** | Centralized API Gateway dynamically routing `/api/users/**`, `/api/events/**`, and `/api/media/**`. | Spring Cloud Gateway |
| **🔍 Service Registry** | Live microservices registration & discovery dashboard. | Netflix Eureka Server (`:8761`) |
| **⚙️ Centralized Config** | Native profile Config Server reading properties from `classpath:/config`. | Spring Cloud Config (`:8888`) |
| **🎨 Glassmorphism React UI** | Rich UI with ambient glow animations, dark/light theme, custom delete modals, and toast alerts. | React 18, Vite, CSS Design System |

---

## 📦 Microservices & Ports

| Module | Service Name | Port | Database / Storage | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`eureka_server`** | Eureka Registry | `8761` | In-Memory Registry | Central Service Discovery Dashboard |
| **`config-server`** | Config Server | `8888` | Classpath Native Config | Centralized Configuration Provider |
| **`api-gateway`** | API Gateway | `8080` | Dynamic Route Locator | Entry point & Global CORS Handler |
| **`user-service`** | User Microservice | `8081` | MySQL (`users_db`) | User Profiles CRUD |
| **`event-service`** | Event Microservice | `8082` | MongoDB (`memories_db`) | Memory Events CRUD |
| **`media-service`** | Media Microservice | `8083` | GCP Cloud Storage Bucket | Image Uploads & File URL Resolution |
| **`frontend`** | React SPA | `3000` | Browser Application | Glassmorphism Web Interface |

---

## 🚀 Getting Started

### Option 1: Docker Compose (Single Command Run)
Run the entire architecture (MySQL, MongoDB, Eureka, Config Server, Gateway, Microservices, & React UI):
```bash
docker-compose up --build
```

### Option 2: Running Microservices Standalone

1. **Start Eureka Registry Server**:
   ```bash
   cd eureka_server
   .\mvnw.cmd spring-boot:run
   ```
2. **Start Spring Cloud Config Server**:
   ```bash
   cd config-server
   .\mvnw.cmd spring-boot:run
   ```
3. **Start API Gateway**:
   ```bash
   cd api-gateway
   .\mvnw.cmd spring-boot:run
   ```
4. **Start Business Microservices**:
   ```bash
   # User Service (Port 8081)
   cd user-service && .\mvnw.cmd spring-boot:run

   # Event Service (Port 8082)
   cd event-service && .\mvnw.cmd spring-boot:run

   # Media Service (Port 8083)
   cd media-service && .\mvnw.cmd spring-boot:run
   ```

### Option 3: Running React SPA UI
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📡 API Endpoints

### 👤 User Service (`/api/users/**`)
- `GET /api/users` — Retrieve all user profiles from MySQL.
- `POST /api/users` — Create a new user profile (`{ "name": "...", "email": "..." }`).
- `GET /api/users/{id}` — Get user details by ID.

### 📅 Event Service (`/api/events/**`)
- `GET /api/events` — Retrieve all memory events from MongoDB.
- `POST /api/events` — Create a memory event (`{ "userId": 1, "title": "...", "eventDate": "...", "location": "..." }`).
- `PUT /api/events/{id}` — Update an existing memory event.
- `DELETE /api/events/{id}` — Delete a memory event from MongoDB.
- `PATCH /api/events/{id}/images` — Attach image URL to memory event.

### 🖼️ Media Service (`/api/media/**`)
- `POST /api/media/upload` — Upload image file (`MultipartFile file`, `eventId`) to GCP Cloud Storage.
- `GET /api/media/files/{filename}` — Download/view local media asset fallback.

---

## 📁 Repository Structure

```
d:\My_Memories\
├── eureka_server\           # Netflix Eureka Service Registry (:8761)
├── config-server\           # Spring Cloud Config Server (:8888)
│   └── src\main\resources\config\  # Centralized YAML Configs
├── api-gateway\             # Spring Cloud Gateway (:8080)
├── user-service\            # MySQL User Microservice (:8081)
├── event-service\           # MongoDB Event Microservice (:8082)
├── media-service\           # GCP Storage Media Microservice (:8083)
├── frontend\                # React 18 + Vite Single Page Application (:3000)
│   ├── src\
│   │   ├── components\      # Auth, Gallery, Edit Modal, Media Uploader, Status Bar
│   │   ├── services\        # Axios API Gateway integration
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Full Stack Orchestration
└── README.md
```

---

<div align="center">
  <sub>Built with ❤️ using Spring Cloud, Java 21, React 18, and Google Cloud Storage.</sub>
</div>
