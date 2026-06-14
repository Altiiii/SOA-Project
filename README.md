# AI Study Coach PRO

SOA university project — .NET 8 microservices backend + React/Vite frontend.

## Local Development

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- PostgreSQL running on port 5433

### Run backend services

```bash
cd AIStudyCoachPRO
# Start all services (each in its own terminal):
dotnet run --project ApiGateway          # port 5000
dotnet run --project UserService         # port 5150
dotnet run --project SubjectService      # port 5151
dotnet run --project StudyService        # port 5152
dotnet run --project RecommendationService # port 5153
```

Or use the provided `start-backend.bat` script.

### Run frontend

```bash
cd AIStudyCoachFrontend
npm install
npm run dev    # http://localhost:5173
```

### Run tests

```bash
cd AIStudyCoachPRO
dotnet test
```

---

## Azure Deployment Preparation

### Azure Resources Required

| Resource | Name | Purpose |
|---|---|---|
| Azure Static Web Apps | `aistudycoach-frontend` | React frontend |
| Azure App Service | `aistudycoach-gateway` | ApiGateway (port 5000) |
| Azure App Service | `aistudycoach-userservice` | UserService (port 5150) |
| Azure App Service | `aistudycoach-subjectservice` | SubjectService (port 5151) |
| Azure App Service | `aistudycoach-studyservice` | StudyService (port 5152) |
| Azure App Service | `aistudycoach-recommendationservice` | RecommendationService (port 5153) |
| Azure Database for PostgreSQL | `aistudycoach-postgres` | Shared PostgreSQL server |

### PostgreSQL Databases

Create three databases on the Azure PostgreSQL server:

- `AIStudyCoach_UserDb`
- `AIStudyCoach_SubjectDb`
- `AIStudyCoach_StudyDb`

### Environment Variables to Set on Each App Service

#### ApiGateway
```
ASPNETCORE_ENVIRONMENT=Production
```

#### UserService
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=aistudycoach-postgres.postgres.database.azure.com;Port=5432;Database=AIStudyCoach_UserDb;Username=postgresadmin;Password=<YOUR_PASSWORD>;Ssl Mode=Require;Trust Server Certificate=true
Jwt__Key=<YOUR_JWT_SECRET_MIN_32_CHARS>
Jwt__Issuer=AIStudyCoachPRO
Jwt__Audience=AIStudyCoachPROUsers
```

#### SubjectService
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=aistudycoach-postgres.postgres.database.azure.com;Port=5432;Database=AIStudyCoach_SubjectDb;Username=postgresadmin;Password=<YOUR_PASSWORD>;Ssl Mode=Require;Trust Server Certificate=true
Jwt__Key=<YOUR_JWT_SECRET_MIN_32_CHARS>
Jwt__Issuer=AIStudyCoachPRO
Jwt__Audience=AIStudyCoachPROUsers
```

#### StudyService
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=aistudycoach-postgres.postgres.database.azure.com;Port=5432;Database=AIStudyCoach_StudyDb;Username=postgresadmin;Password=<YOUR_PASSWORD>;Ssl Mode=Require;Trust Server Certificate=true
Jwt__Key=<YOUR_JWT_SECRET_MIN_32_CHARS>
Jwt__Issuer=AIStudyCoachPRO
Jwt__Audience=AIStudyCoachPROUsers
```

#### RecommendationService
```
ASPNETCORE_ENVIRONMENT=Production
```

> **Important:** Set all secrets via Azure App Service "Application Settings" — never commit real passwords to git.

### CORS

The ApiGateway is already configured to allow both:
- `http://localhost:5173` (local development)
- `https://aistudycoach-frontend.azurestaticapps.net` (Azure Static Web Apps)

Managed in `ApiGateway/appsettings.json` → `Cors.AllowedOrigins`.

### Ocelot Production Routes

When `ASPNETCORE_ENVIRONMENT=Production`, the ApiGateway automatically loads `ocelot.Production.json` which routes to:

| Upstream path | Downstream Azure service |
|---|---|
| `/gateway/auth/*` | `aistudycoach-userservice.azurewebsites.net` |
| `/gateway/users/*` | `aistudycoach-userservice.azurewebsites.net` |
| `/gateway/subjects/*` | `aistudycoach-subjectservice.azurewebsites.net` |
| `/gateway/topics/*` | `aistudycoach-subjectservice.azurewebsites.net` |
| `/gateway/study-sessions/*` | `aistudycoach-studyservice.azurewebsites.net` |
| `/gateway/quiz-results/*` | `aistudycoach-studyservice.azurewebsites.net` |
| `/gateway/progress/*` | `aistudycoach-studyservice.azurewebsites.net` |
| `/gateway/recommendations/*` | `aistudycoach-recommendationservice.azurewebsites.net` |

### Frontend Build

The frontend reads `VITE_API_BASE_URL` from environment:
- **Development** (`.env.development`): `http://localhost:5000/gateway`
- **Production** (`.env.production`): `https://aistudycoach-gateway.azurewebsites.net/gateway`

Build for production:

```bash
cd AIStudyCoachFrontend
npm run build    # outputs to AIStudyCoachFrontend/dist/
```

Deploy the `dist/` folder to Azure Static Web Apps.

### Values to Replace Before Deploying

| Placeholder | What to replace with |
|---|---|
| `YOUR_AZURE_POSTGRES_PASSWORD` | Real PostgreSQL admin password |
| `YOUR_AZURE_JWT_SECRET_KEY_MIN_32_CHARS` | Random string ≥ 32 characters, same across all services |
| `aistudycoach-frontend.azurestaticapps.net` | Actual Azure Static Web Apps URL |
| `aistudycoach-gateway.azurewebsites.net` | Actual ApiGateway App Service URL |

### How to Build Locally (CI equivalent)

```bash
cd AIStudyCoachPRO
dotnet restore AIStudyCoachPRO.sln
dotnet build AIStudyCoachPRO.sln --configuration Release
dotnet test AIStudyCoachPRO.sln

cd ../AIStudyCoachFrontend
npm install
npm run build
```

### Local Development Still Works

Local dev is unchanged:
- `ASPNETCORE_ENVIRONMENT` defaults to `Development` when running `dotnet run`
- `ocelot.Development.json` loads automatically and routes to `localhost:5150–5153`
- Frontend `.env.development` points to `http://localhost:5000/gateway`
- No environment variable changes needed on the dev machine

---

## Render Deployment Guide

> **You do NOT need Docker locally.** Render clones your GitHub repository and builds each Dockerfile automatically on its cloud infrastructure. Docker never needs to run on your machine.

### Overview

| Component | Render Service Type | Source |
|---|---|---|
| ApiGateway | Web Service (Docker) | `AIStudyCoachPRO/ApiGateway/Dockerfile` |
| UserService | Web Service (Docker) | `AIStudyCoachPRO/UserService/Dockerfile` |
| SubjectService | Web Service (Docker) | `AIStudyCoachPRO/SubjectService/Dockerfile` |
| StudyService | Web Service (Docker) | `AIStudyCoachPRO/StudyService/Dockerfile` |
| RecommendationService | Web Service (Docker) | `AIStudyCoachPRO/RecommendationService/Dockerfile` |
| Frontend | Static Site | `AIStudyCoachFrontend/` |
| PostgreSQL | PostgreSQL database | Render managed |

### Step 1 — Create Render PostgreSQL

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Name: `aistudycoach-db`
3. Database: `aistudycoach` (Render manages the actual DB names per connection)
4. Copy the **Internal Database URL** — you will need it for each backend service

> Render PostgreSQL gives you one connection string. Create the three logical databases by connecting to it and running:
> ```sql
> CREATE DATABASE "AIStudyCoach_UserDb";
> CREATE DATABASE "AIStudyCoach_SubjectDb";
> CREATE DATABASE "AIStudyCoach_StudyDb";
> ```
> Or use separate Render PostgreSQL instances — one per service.

### Step 2 — Deploy each backend service

For **each** of the 5 backend services, create a new **Web Service** on Render:

1. **New** → **Web Service** → connect your GitHub repository
2. Set the following per service:

#### UserService
| Setting | Value |
|---|---|
| **Name** | `aistudycoach-userservice` |
| **Root Directory** | `AIStudyCoachPRO` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./UserService/Dockerfile` |
| **Environment Variables** | See below |

#### SubjectService
| Setting | Value |
|---|---|
| **Name** | `aistudycoach-subjectservice` |
| **Root Directory** | `AIStudyCoachPRO` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./SubjectService/Dockerfile` |
| **Environment Variables** | See below |

#### StudyService
| Setting | Value |
|---|---|
| **Name** | `aistudycoach-studyservice` |
| **Root Directory** | `AIStudyCoachPRO` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./StudyService/Dockerfile` |
| **Environment Variables** | See below |

#### RecommendationService
| Setting | Value |
|---|---|
| **Name** | `aistudycoach-recommendationservice` |
| **Root Directory** | `AIStudyCoachPRO` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./RecommendationService/Dockerfile` |
| **Environment Variables** | See below |

#### ApiGateway
| Setting | Value |
|---|---|
| **Name** | `aistudycoach-gateway` |
| **Root Directory** | `AIStudyCoachPRO` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./ApiGateway/Dockerfile` |
| **Environment Variables** | See below |

### Step 3 — Set environment variables per service

#### UserService environment variables
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=<RENDER_PG_HOST>;Port=5432;Database=AIStudyCoach_UserDb;Username=<RENDER_PG_USER>;Password=<RENDER_PG_PASSWORD>;Ssl Mode=Require;Trust Server Certificate=true
Jwt__Key=<YOUR_JWT_SECRET_MIN_32_CHARS>
```

#### SubjectService environment variables
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=<RENDER_PG_HOST>;Port=5432;Database=AIStudyCoach_SubjectDb;Username=<RENDER_PG_USER>;Password=<RENDER_PG_PASSWORD>;Ssl Mode=Require;Trust Server Certificate=true
Jwt__Key=<YOUR_JWT_SECRET_MIN_32_CHARS>
```

#### StudyService environment variables
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=<RENDER_PG_HOST>;Port=5432;Database=AIStudyCoach_StudyDb;Username=<RENDER_PG_USER>;Password=<RENDER_PG_PASSWORD>;Ssl Mode=Require;Trust Server Certificate=true
Jwt__Key=<YOUR_JWT_SECRET_MIN_32_CHARS>
```

#### RecommendationService environment variables
```
ASPNETCORE_ENVIRONMENT=Production
```
*(No database. No JWT validation. No connection string needed.)*

#### ApiGateway environment variables
```
ASPNETCORE_ENVIRONMENT=Production
```

> **`Jwt__Key`** must be the **same string** across UserService, SubjectService, and StudyService. It is the signing key for JWT tokens. Minimum 32 characters.

> **`__` (double underscore)** is how ASP.NET Core reads nested config from environment variables. `Jwt__Key` maps to `Jwt.Key` in appsettings.

### Step 4 — Update ocelot.Production.json with real Render URLs

After all 4 downstream services are deployed, copy their Render `.onrender.com` URLs and replace the placeholders in `AIStudyCoachPRO/ApiGateway/ocelot.Production.json`:

| Placeholder | Replace with |
|---|---|
| `YOUR_RENDER_USERSERVICE_URL.onrender.com` | e.g. `aistudycoach-userservice.onrender.com` |
| `YOUR_RENDER_SUBJECTSERVICE_URL.onrender.com` | e.g. `aistudycoach-subjectservice.onrender.com` |
| `YOUR_RENDER_STUDYSERVICE_URL.onrender.com` | e.g. `aistudycoach-studyservice.onrender.com` |
| `YOUR_RENDER_RECOMMENDATIONSERVICE_URL.onrender.com` | e.g. `aistudycoach-recommendationservice.onrender.com` |
| `YOUR_RENDER_GATEWAY_URL.onrender.com` (GlobalConfiguration.BaseUrl) | e.g. `aistudycoach-gateway.onrender.com` |

Commit and push — Render auto-redeploys ApiGateway with the new config.

### Step 5 — Deploy the frontend as a Static Site

1. **New** → **Static Site** → connect your GitHub repository
2. Settings:

| Setting | Value |
|---|---|
| **Name** | `aistudycoach-frontend` |
| **Root Directory** | `AIStudyCoachFrontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

3. Add environment variable:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://aistudycoach-gateway.onrender.com/gateway` |

> Replace the URL with your actual ApiGateway Render URL.

### Step 6 — Update CORS with the real frontend URL

Edit `AIStudyCoachPRO/ApiGateway/appsettings.json` and replace `YOUR_RENDER_FRONTEND_URL.onrender.com` with the actual URL Render assigns to your static site (e.g. `aistudycoach-frontend.onrender.com`).

Commit and push — ApiGateway redeploys automatically.

### How Render builds the Dockerfiles

Render reads the `Root Directory` setting, uses it as the Docker build context, and runs `docker build -f <Dockerfile Path> <Root Directory>`. This means:

- All `COPY` commands in the Dockerfiles are relative to `AIStudyCoachPRO/`
- The `PORT` environment variable is injected by Render at runtime
- Each service CMD reads `${PORT:-8080}` so the app listens on Render's assigned port

You never run Docker commands yourself — Render handles everything.

### Troubleshooting

#### 502 Bad Gateway from ApiGateway
- One of the downstream services failed to start or is still deploying
- Check the Render logs for UserService, SubjectService, StudyService, RecommendationService
- Verify `ocelot.Production.json` has the correct `.onrender.com` URLs (no trailing slash on host)

#### PostgreSQL connection error on startup
- `ConnectionStrings__DefaultConnection` env var is missing or has wrong credentials
- Go to the Render service → Environment → verify the variable is set
- Use the **Internal** hostname from Render PostgreSQL (not the external one) for services in the same Render region

#### CORS error in browser
- The frontend URL is not in `ApiGateway/appsettings.json` → `Cors.AllowedOrigins`
- Update the array, commit, push, redeploy ApiGateway

#### JWT validation fails (401 on all protected endpoints)
- `Jwt__Key` environment variable is not set or differs between services
- It must be identical on UserService, SubjectService, and StudyService

#### Service fails to start — port binding error
- Render injects `PORT` at runtime. The Dockerfile CMD uses `${PORT:-8080}`
- If the app is not starting, check Render logs for the actual port Render assigned

### Deployment order recommendation

Deploy services in this order to avoid dependent failures:
1. PostgreSQL database
2. UserService
3. SubjectService
4. StudyService
5. RecommendationService
6. ApiGateway (last — needs the other four URLs in ocelot.Production.json)
7. Frontend Static Site
