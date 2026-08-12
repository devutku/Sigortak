# 🚗 Sigortak — Araba Sigorta Takip Sistemi

**CQRS + Event-Driven Architecture** ile araç poliçelerinin uçtan uca yönetimi.

## 🏗️ Mimari

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Angular 18 │────▶│  API Gateway     │────▶│  Identity   │
│  (Frontend) │     │  (YARP - :5000)  │     │  API (:5001)│
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                     │
                    ┌─────────────────────────────────┼─────────────────┐
                    │                                 │                 │
              ┌─────▼─────┐  ┌──────────┐  ┌────────▼──────┐  ┌──────▼──────┐
              │ PostgreSQL │  │  Redis   │  │   RabbitMQ    │  │   Kafka     │
              │ Write/Read │  │  Cache   │  │   Commands    │  │   Events    │
              └────────────┘  └──────────┘  └───────────────┘  └─────────────┘
```

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker & Docker Compose
- .NET 8 SDK

### 1. Altyapıyı başlat
```bash
docker-compose up -d
```

### 2. API'yi çalıştır
```bash
dotnet run --project src/Services/Identity/Sigortak.Identity.API
```

### 3. Swagger UI
- Identity API: http://localhost:5001
- Gateway: http://localhost:5000

### 4. Altyapı Panelleri
| Servis | URL | Kullanıcı/Şifre |
|--------|-----|-----------------|
| pgAdmin | http://localhost:5050 | admin@sigortak.dev / SigortakPgAdmin2026! |
| RabbitMQ | http://localhost:15672 | sigortak / SigortakRabbit2026! |
| Kafka UI | http://localhost:8090 | — |
| MinIO | http://localhost:9001 | sigortak_minio / SigortakMinio2026!Secure |

## 📁 Proje Yapısı

```
src/
├── ApiGateway/
│   └── Sigortak.Gateway/          # YARP Reverse Proxy
├── BuildingBlocks/
│   ├── Sigortak.Common/           # Result pattern, Entities, Exceptions
│   ├── Sigortak.CQRS/             # MediatR, Commands, Queries
│   └── Sigortak.EventBus/         # RabbitMQ + Kafka
└── Services/
    └── Identity/
        ├── Sigortak.Identity.API/           # Controllers, Middleware
        ├── Sigortak.Identity.Application/   # Commands, Queries, Handlers
        ├── Sigortak.Identity.Domain/        # Entities, Enums
        └── Sigortak.Identity.Infrastructure/# EF Core, JWT, Repos
```

## 🔑 API Endpoints

### Auth (Public)
- `POST /api/v1/auth/register` — Yeni kullanıcı kaydı
- `POST /api/v1/auth/login` — Giriş (JWT + Refresh Token)
- `POST /api/v1/auth/refresh-token` — Token yenileme

### Users (Korumalı)
- `GET /api/v1/users` — Tüm kullanıcılar (SystemAdmin)
- `GET /api/v1/users/{id}` — Kullanıcı detayı

### Health
- `GET /health` — Sistem sağlık kontrolü

## 🛡️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | .NET 8, ASP.NET Core |
| CQRS | MediatR 12 |
| Validation | FluentValidation 11 |
| Write DB | PostgreSQL 16 |
| Read Cache | Redis 7 |
| Commands | RabbitMQ 3 (DLQ) |
| Events | Apache Kafka (KRaft) |
| Auth | JWT + BCrypt |
| Gateway | YARP 2 |
| Logging | Serilog |
| Docs | Swagger/OpenAPI |
