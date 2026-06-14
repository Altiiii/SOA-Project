# Build stage — uses full SDK to restore + publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore only this service's project (layer-cached until .csproj changes)
COPY UserService/UserService.csproj UserService/
RUN dotnet restore UserService/UserService.csproj

# Copy source and publish
COPY UserService/ UserService/
RUN dotnet publish UserService/UserService.csproj -c Release -o /app/publish --no-restore

# Runtime stage — lightweight ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

# Render injects PORT at runtime; fall back to 8080 for other environments
CMD ["sh", "-c", "dotnet UserService.dll --urls http://+:${PORT:-8080}"]
