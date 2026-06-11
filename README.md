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
