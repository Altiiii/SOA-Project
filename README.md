# AI Study Coach PRO — Intelligent Study Optimization Platform

**Course:** Service Oriented Architecture
**Team:** Altin Ismaili, Brikena Azizi
**GitHub:** [github.com/Altiiii/SOA-Project](https://github.com/Altiiii/SOA-Project)

---

## Short Description

AI Study Coach PRO is a cloud-deployed, microservices-based study management platform. Students track their subjects, topics, study sessions, and quiz results. A built-in AI recommendation engine analyzes their performance data and generates personalized study recommendations — identifying weak areas and producing a readiness score before exams.

---

## Problem Statement

Students often study inefficiently — spending equal time on strong and weak topics, lacking objective feedback, and having no visibility into their overall exam readiness. Existing tools treat study tracking and performance analysis as separate concerns.

AI Study Coach PRO solves this by combining structured study tracking with automated AI-driven analysis in a single, integrated platform built on a Service-Oriented Architecture.

---

## Main Features

- User registration and login with JWT authentication
- Role-based authorization (Student / Admin)
- Subject and topic management per user
- Study session logging with duration tracking
- Quiz result recording per topic
- AI recommendation engine that analyzes performance and generates:
  - Risk level (Low / Medium / High)
  - Readiness score (0–100)
  - Weak area identification (topics with score < 50%)
  - Personalized study recommendations
- Admin panel to view all registered users
- Full data isolation — each user sees only their own data
- Fully deployed on Render with live public URLs

---

## System Architecture

The application follows a **Service-Oriented Architecture** with five independently deployable services behind an API Gateway.

```
                         ┌─────────────────────────┐
                         │     React Frontend       │
                         │  (Vite + Tailwind CSS)   │
                         └────────────┬────────────┘
                                      │ HTTPS
                         ┌────────────▼────────────┐
                         │       API Gateway        │
                         │   (Ocelot, .NET 8)       │
                         └──┬──────┬──────┬──────┬──┘
                            │      │      │      │
           ┌────────────────▼─┐ ┌──▼────┐ ┌─────▼──────────┐ ┌────────────────────────┐
           │   UserService    │ │Subject│ │  StudyService   │ │ RecommendationService  │
           │  (Auth / Users)  │ │Service│ │(Sessions/Quiz/  │ │  (AI Engine, no DB)    │
           └────────┬─────────┘ └──┬───┘ │   Progress)     │ └────────────────────────┘
                    │              │     └────────┬─────────┘
           ┌────────▼──────────────▼──────────────▼─────────┐
           │                PostgreSQL Database               │
           │    UserDb    │    SubjectDb    │    StudyDb      │
           └─────────────────────────────────────────────────┘
```

All client traffic enters exclusively through the API Gateway. Each service owns its own isolated database. The RecommendationService is stateless — it receives data from the client and returns analysis results without persisting anything.

---

## Microservices Overview

| Service | Port (Local) | Responsibility |
|---|---|---|
| **ApiGateway** | 5000 | Routes all `/gateway/*` requests to downstream services; enforces CORS |
| **UserService** | 5150 | Registration, login, JWT issuance, user management, admin seeding |
| **SubjectService** | 5151 | Subject and topic CRUD, scoped to the authenticated user |
| **StudyService** | 5152 | Study sessions, quiz results, progress analytics |
| **RecommendationService** | 5153 | Stateless AI engine — risk scoring, readiness calculation, recommendations |

### API Gateway Routes

| Frontend calls | Routed to |
|---|---|
| `POST /gateway/auth/register` | UserService |
| `POST /gateway/auth/login` | UserService |
| `GET /gateway/users/` | UserService (Admin only) |
| `GET/POST /gateway/subjects/` | SubjectService |
| `GET/POST /gateway/topics/` | SubjectService |
| `GET/POST /gateway/study-sessions/` | StudyService |
| `GET/POST /gateway/quiz-results/` | StudyService |
| `GET /gateway/progress/{userId}` | StudyService |
| `POST /gateway/recommendations/analyze` | RecommendationService |

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| .NET | 8.0 | Runtime and SDK |
| ASP.NET Core Web API | 8.0 | REST API framework |
| Ocelot | 23.3.3 | API Gateway and request routing |
| Entity Framework Core | 8.0 | ORM and database migrations |
| Npgsql EF Core Provider | 8.0.10 | PostgreSQL driver |
| ASP.NET Core JWT Bearer | 8.0 | JWT authentication middleware |
| ASP.NET Core Identity | 8.0 | Password hashing (PBKDF2 + SHA-512) |

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client with JWT interceptor |

### Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Docker | Container runtime (backend services on Render) |
| Render | Cloud deployment platform |
| GitHub Actions | CI — build and test on every push |
| xUnit + Moq | Unit testing framework |

---

## Database

Three separate PostgreSQL databases — one per stateful service:

| Database | Owner Service | Contains |
|---|---|---|
| `AIStudyCoach_UserDb` | UserService | Users, roles |
| `AIStudyCoach_SubjectDb` | SubjectService | Subjects, topics |
| `AIStudyCoach_StudyDb` | StudyService | Study sessions, quiz results |

EF Core migrations run automatically on service startup (`context.Database.Migrate()`). No manual schema setup is required once a valid connection string is provided.

---

## Authentication and Authorization

- **Token type:** JWT Bearer (HMAC-SHA256)
- **Token expiry:** 60 minutes
- **Claims stored in token:** UserId, Email, Username, Role
- **Password storage:** PBKDF2 + SHA-512 via `PasswordHasher<T>` — plain-text passwords are never stored
- **Roles:** `Student` (default on register), `Admin`
- **Data isolation:** Every protected endpoint reads the user identity from the JWT claim — never from the URL or request body. Users can only access their own data.
- **Admin endpoint:** `GET /gateway/users/` is restricted to `[Authorize(Roles = "Admin")]`

A default Admin account is automatically seeded on first startup if none exists.

---

## API Gateway

The gateway uses **Ocelot** with environment-specific configuration overlay:

| File | Loaded when | Routes to |
|---|---|---|
| `ocelot.json` | Always (base config) | — |
| `ocelot.Development.json` | `ASPNETCORE_ENVIRONMENT=Development` | `localhost:5150–5153` |
| `ocelot.Production.json` | `ASPNETCORE_ENVIRONMENT=Production` | `*.onrender.com` |

CORS is configured in `ApiGateway/appsettings.json` under `Cors.AllowedOrigins`. In production it permits both the local dev origin and the deployed frontend origin.

---

## Frontend

The React frontend communicates exclusively with the API Gateway via `VITE_API_BASE_URL`:

- **Development** (`.env.development`): `http://localhost:5000/gateway`
- **Production** (`.env.production`): `https://aistudycoach-gateway.onrender.com/gateway`

All API calls attach the JWT from `localStorage` via an Axios request interceptor. Unauthenticated users are redirected to `/login` by a route guard.

**Frontend source structure:**

```
AIStudyCoachFrontend/src/
├── api/          # Axios instance and API call functions
├── components/   # Shared UI components
├── pages/        # Page-level components (Login, Dashboard, Subjects, AI Coach, etc.)
└── assets/       # Static assets
```

---

## Deployment on Render

All five backend services are deployed as **Docker Web Services**. The frontend is deployed as a **Static Site**. Docker runs only on Render — no local Docker installation is required.

| Service | Render Type | Dockerfile path |
|---|---|---|
| ApiGateway | Web Service (Docker) | `AIStudyCoachPRO/ApiGateway/Dockerfile` |
| UserService | Web Service (Docker) | `AIStudyCoachPRO/UserService/Dockerfile` |
| SubjectService | Web Service (Docker) | `AIStudyCoachPRO/SubjectService/Dockerfile` |
| StudyService | Web Service (Docker) | `AIStudyCoachPRO/StudyService/Dockerfile` |
| RecommendationService | Web Service (Docker) | `AIStudyCoachPRO/RecommendationService/Dockerfile` |
| Frontend | Static Site | `AIStudyCoachFrontend/` |

Secrets (database connection strings, JWT signing key) are injected via Render environment variables using the `__` double-underscore notation that ASP.NET Core maps to nested config paths (e.g. `Jwt__Key` → `Jwt:Key`). No secrets are committed to the repository.

---

## Live Application

| Component | URL |
|---|---|
| **Frontend** | [aistudycoach-frontend.onrender.com](https://aistudycoach-frontend.onrender.com) |
| **API Gateway** | [aistudycoach-gateway.onrender.com](https://aistudycoach-gateway.onrender.com) |
| **UserService** | [aistudycoach-userservice.onrender.com](https://aistudycoach-userservice.onrender.com) |
| **SubjectService** | [aistudycoach-subjectservice.onrender.com](https://aistudycoach-subjectservice.onrender.com) |
| **StudyService** | [aistudycoach-studyservice.onrender.com](https://aistudycoach-studyservice.onrender.com) |
| **RecommendationService** | [aistudycoach-recommendationservice.onrender.com](https://aistudycoach-recommendationservice.onrender.com) |

> **Note:** Render free-tier services sleep after 15 minutes of inactivity. The first request after a sleep period can take 1–3 minutes to wake up and may temporarily return 502. Once awake, the application works normally.

---

## Admin Login

A default Admin account is automatically created on first startup.

| Field | Value |
|---|---|
| Email | `admin@studycoach.com` |
| Password | `Admin@2025!` |

Admin users can access the Users page to view all registered accounts.

---

## Testing

The solution contains **57 unit tests** across four test projects, all passing.

| Test Project | Tests | Coverage |
|---|---|---|
| `UserService.Tests` | 8 | Registration, login, duplicate detection, JWT generation |
| `SubjectService.Tests` | 24 | Subject/topic CRUD, cross-user data isolation |
| `StudyService.Tests` | 15 | Study sessions, quiz results, progress, data isolation |
| `RecommendationService.Tests` | 10 | Risk scoring algorithm, readiness calculation, recommendations |

**Test stack:** xUnit 2.9.2, Moq 4.20.72, EF Core InMemory (test isolation without a real database)

Run all tests:

```bash
cd AIStudyCoachPRO
dotnet test
```

---

## How to Run Locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [Node.js 20+](https://nodejs.org)
- PostgreSQL running on **port 5433**

### 1. Create databases

Connect to your local PostgreSQL instance and run:

```sql
CREATE DATABASE "AIStudyCoach_UserDb";
CREATE DATABASE "AIStudyCoach_SubjectDb";
CREATE DATABASE "AIStudyCoach_StudyDb";
```

### 2. Configure connection strings

Update the `DefaultConnection` value in each service's `appsettings.json`:

- `AIStudyCoachPRO/UserService/appsettings.json`
- `AIStudyCoachPRO/SubjectService/appsettings.json`
- `AIStudyCoachPRO/StudyService/appsettings.json`

Example:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5433;Database=AIStudyCoach_UserDb;Username=postgres;Password=yourpassword"
}
```

EF Core migrations apply automatically on service startup — no `dotnet ef` commands needed.

### 3. Start the backend

Open five terminal windows in `AIStudyCoachPRO/`:

```bash
dotnet run --project ApiGateway            # http://localhost:5000
dotnet run --project UserService           # http://localhost:5150
dotnet run --project SubjectService        # http://localhost:5151
dotnet run --project StudyService          # http://localhost:5152
dotnet run --project RecommendationService # http://localhost:5153
```

### 4. Start the frontend

```bash
cd AIStudyCoachFrontend
npm install
npm run dev    # http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Folder Structure

```
SOA Project/
├── AIStudyCoachPRO/                    # Backend solution
│   ├── AIStudyCoachPRO.sln
│   ├── ApiGateway/                     # Ocelot API Gateway
│   │   ├── ocelot.json                 # Base routing config
│   │   ├── ocelot.Development.json     # Local dev routes
│   │   └── ocelot.Production.json      # Production (Render) routes
│   ├── UserService/                    # Auth + user management
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── DTOs/
│   │   ├── Migrations/
│   │   ├── Models/
│   │   └── Services/
│   ├── SubjectService/                 # Subjects + topics
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── DTOs/
│   │   ├── Migrations/
│   │   └── Models/
│   ├── StudyService/                   # Study sessions + quiz results
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── DTOs/
│   │   ├── Migrations/
│   │   └── Models/
│   ├── RecommendationService/          # Stateless AI engine (no DB)
│   │   ├── Controllers/
│   │   ├── DTOs/
│   │   └── Services/
│   ├── UserService.Tests/
│   ├── SubjectService.Tests/
│   ├── StudyService.Tests/
│   └── RecommendationService.Tests/
│
├── AIStudyCoachFrontend/               # React + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   ├── .env.development
│   └── .env.production
│
└── .github/workflows/
    ├── backend-build.yml               # CI: dotnet build + test
    └── frontend-build.yml             # CI: npm build
```

---

## Demo Flow

1. Open [aistudycoach-frontend.onrender.com](https://aistudycoach-frontend.onrender.com)
2. **Register** a new student account, or log in with the Admin credentials above
3. Create a **Subject** (e.g. "Mathematics") and add **Topics** under it (e.g. "Calculus", "Algebra")
4. Log a **Study Session** — record the time spent studying
5. Record **Quiz Results** for each topic — enter score and maximum score
6. Navigate to **Progress** to view your overall performance and weak areas
7. Use the **AI Coach** — submit your study data to receive a risk level, readiness score (0–100), and personalized recommendations
8. Log in as Admin and visit **Users** to see all registered accounts

---

## Notes

- Render free-tier services sleep after 15 minutes of inactivity. Allow 1–3 minutes on first access.
- JWT tokens expire after 60 minutes. Simply log in again after expiry.
- The Recommendation engine is stateless — it processes the submitted payload and responds immediately without storing data.
- All secrets (JWT key, database credentials) are provided via Render environment variables and are never stored in the repository.

---

## Team Members

| Name | Contribution |
|---|---|
| **Altin Ismaili** | Backend microservices, API Gateway, authentication, database design, unit tests, Docker, Render deployment |
| **Brikena Azizi** | Frontend development, UI/UX design, frontend-backend integration |
