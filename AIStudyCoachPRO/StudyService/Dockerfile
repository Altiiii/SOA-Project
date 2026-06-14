# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY StudyService/StudyService.csproj StudyService/
RUN dotnet restore StudyService/StudyService.csproj

COPY StudyService/ StudyService/
RUN dotnet publish StudyService/StudyService.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

CMD ["sh", "-c", "dotnet StudyService.dll --urls http://+:${PORT:-8080}"]
