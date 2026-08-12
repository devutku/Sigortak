# ============================================
# Sigortak Identity API — Multi-stage Dockerfile
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Proje dosyalarını kopyala (layer cache)
COPY ["src/BuildingBlocks/Sigortak.Common/Sigortak.Common.csproj", "BuildingBlocks/Sigortak.Common/"]
COPY ["src/BuildingBlocks/Sigortak.CQRS/Sigortak.CQRS.csproj", "BuildingBlocks/Sigortak.CQRS/"]
COPY ["src/BuildingBlocks/Sigortak.EventBus/Sigortak.EventBus.csproj", "BuildingBlocks/Sigortak.EventBus/"]
COPY ["src/Services/Identity/Sigortak.Identity.Domain/Sigortak.Identity.Domain.csproj", "Services/Identity/Sigortak.Identity.Domain/"]
COPY ["src/Services/Identity/Sigortak.Identity.Application/Sigortak.Identity.Application.csproj", "Services/Identity/Sigortak.Identity.Application/"]
COPY ["src/Services/Identity/Sigortak.Identity.Infrastructure/Sigortak.Identity.Infrastructure.csproj", "Services/Identity/Sigortak.Identity.Infrastructure/"]
COPY ["src/Services/Identity/Sigortak.Identity.API/Sigortak.Identity.API.csproj", "Services/Identity/Sigortak.Identity.API/"]

RUN dotnet restore "Services/Identity/Sigortak.Identity.API/Sigortak.Identity.API.csproj"

# Tüm kaynak kodunu kopyala
COPY src/ .

WORKDIR "/src/Services/Identity/Sigortak.Identity.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Non-root kullanıcı (güvenlik)
RUN adduser -D -h /app appuser
USER appuser

ENTRYPOINT ["dotnet", "Sigortak.Identity.API.dll"]
