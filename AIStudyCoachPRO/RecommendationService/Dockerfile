# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY RecommendationService/RecommendationService.csproj RecommendationService/
RUN dotnet restore RecommendationService/RecommendationService.csproj

COPY RecommendationService/ RecommendationService/
RUN dotnet publish RecommendationService/RecommendationService.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

CMD ["sh", "-c", "dotnet RecommendationService.dll --urls http://+:${PORT:-8080}"]
