# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY SubjectService/SubjectService.csproj SubjectService/
RUN dotnet restore SubjectService/SubjectService.csproj

COPY SubjectService/ SubjectService/
RUN dotnet publish SubjectService/SubjectService.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

CMD ["sh", "-c", "dotnet SubjectService.dll --urls http://+:${PORT:-8080}"]
