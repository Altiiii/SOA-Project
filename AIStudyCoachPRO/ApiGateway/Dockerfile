# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ApiGateway/ApiGateway.csproj ApiGateway/
RUN dotnet restore ApiGateway/ApiGateway.csproj

COPY ApiGateway/ ApiGateway/
RUN dotnet publish ApiGateway/ApiGateway.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Ensure Ocelot config files are present (publish may not include non-appsettings JSON)
COPY --from=build /src/ApiGateway/ocelot.json .
COPY --from=build /src/ApiGateway/ocelot.Production.json .

ENV ASPNETCORE_ENVIRONMENT=Production

CMD ["sh", "-c", "dotnet ApiGateway.dll --urls http://+:${PORT:-8080}"]
