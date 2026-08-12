# Sprint 1 Walkthrough — Temel Altyapı ve Veri Mimarisi

## Özet

Sprint 1 kapsamında Araba Sigorta Takip Sistemi'nin temel altyapısı oluşturuldu. Tüm infrastructure servisleri Docker Compose ile yapılandırıldı, .NET 8 Clean Architecture + CQRS iskelet mimarisi kuruldu ve JWT tabanlı kimlik doğrulama çalışır hale getirildi.

---

## Yapılanlar

### 1. Docker Compose Altyapısı

8 altyapı servisi Docker Compose ile yapılandırıldı:

| Servis | Image | Port | Durum |
|--------|-------|------|-------|
| PostgreSQL (Write) | `postgres:16-alpine` | `:5432` | ✅ |
| PostgreSQL (Read) | `postgres:16-alpine` | `:5433` | ✅ |
| Redis | `redis:7-alpine` | `:6379` | ✅ |
| RabbitMQ | `rabbitmq:3-management-alpine` | `:5672/:15672` | ✅ |
| Kafka (KRaft) | `confluentinc/cp-kafka:7.7.0` | `:9092` | ✅ |
| Kafka UI | `provectuslabs/kafka-ui` | `:8090` | ✅ |
| MinIO | `minio/minio` | `:9000/:9001` | ✅ |
| pgAdmin | `dpage/pgadmin4` | `:5050` | ✅ |

**Dosyalar:**
- [docker-compose.yml](file:///c:/Users/Admin/git/Sigortak/docker-compose.yml)
- [.env](file:///c:/Users/Admin/git/Sigortak/.env)

---

### 2. .NET 8 Solution (8 Proje, 0 Hata)

```
Sigortak.sln
├── BuildingBlocks/
│   ├── Sigortak.Common         (Result pattern, Entities, Exceptions)
│   ├── Sigortak.CQRS           (MediatR, Commands, Queries, Behaviors)
│   └── Sigortak.EventBus       (RabbitMQ + Kafka abstractions)
├── Services/Identity/
│   ├── Sigortak.Identity.Domain         (User, RefreshToken, Role enum)
│   ├── Sigortak.Identity.Application    (3 Commands, 2 Queries, Validators)
│   ├── Sigortak.Identity.Infrastructure (EF Core, JWT, BCrypt, Repos)
│   └── Sigortak.Identity.API           (Controllers, Middleware, Swagger)
└── ApiGateway/
    └── Sigortak.Gateway                 (YARP Reverse Proxy)
```

---

### 3. CQRS Mimarisi (BuildingBlocks)

#### [Sigortak.Common](file:///c:/Users/Admin/git/Sigortak/src/BuildingBlocks/Sigortak.Common)
- `Result<T>` / `Result` — Standart API response wrapper
- `PagedResult<T>` — Sayfalama desteği
- `BaseEntity` / `AuditableEntity` — GUID ID + audit alanları
- `BusinessException`, `NotFoundException`, `ValidationException`, `ForbiddenException`

#### [Sigortak.CQRS](file:///c:/Users/Admin/git/Sigortak/src/BuildingBlocks/Sigortak.CQRS)
- `ICommand<T>` / `ICommandHandler<T>` — MediatR üzerinden write operations
- `IQuery<T>` / `IQueryHandler<T>` — MediatR üzerinden read operations
- `IDomainEvent` / `DomainEvent` — Kafka event base
- `ValidationBehavior` — FluentValidation pipeline
- `LoggingBehavior` — Performans izleme (>500ms uyarı)

#### [Sigortak.EventBus](file:///c:/Users/Admin/git/Sigortak/src/BuildingBlocks/Sigortak.EventBus)
- `IEventBus` — Publish/Subscribe abstraction
- `RabbitMqEventBus` — Topic exchange, DLQ desteği, persistent mesajlar
- `KafkaEventBus` — Idempotent producer, event headers

---

### 4. Identity Service — JWT Auth

#### Commands (Write)
| Command | Handler | Validator |
|---------|---------|-----------|
| `RegisterCommand` | Kullanıcı oluştur + JWT üret | Email format, şifre gücü, username uniqueness |
| `LoginCommand` | Şifre doğrula + token rotation | Zorunlu alan kontrolü |
| `RefreshTokenCommand` | Token yenileme + reuse detection | — |

#### Queries (Read)
| Query | Handler |
|-------|---------|
| `GetUserByIdQuery` | ID ile kullanıcı bilgisi |
| `GetUsersQuery` | Tüm kullanıcılar (Admin only) |

#### Infrastructure
- **EF Core 8** → PostgreSQL 16, Fluent API config, snake_case tablo isimleri
- **JWT** → HS256, role-based claims, configurable expiry
- **BCrypt** → Work factor 11 password hashing
- **Seed Data** → admin / Admin123! (SystemAdmin rolü)

#### API Endpoints
| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/v1/auth/register` | Public | Kullanıcı kaydı |
| POST | `/api/v1/auth/login` | Public | JWT + Refresh Token |
| POST | `/api/v1/auth/refresh-token` | Public | Token yenileme |
| GET | `/api/v1/users` | SystemAdmin | Kullanıcı listesi |
| GET | `/api/v1/users/{id}` | Authenticated | Kullanıcı detayı |
| GET | `/health` | Public | Sistem sağlık kontrolü |

---

### 5. API Gateway (YARP)

- **Port:** 5000
- Auth endpoint'leri → pass-through (JWT validation yok)
- Users endpoint'leri → JWT validation zorunlu
- Health check proxy → Identity `/health` → Gateway `/services/identity/health`
- Active health monitoring (30sn interval)

---

### 6. EF Core Migrations

- ✅ `InitialCreate` migration oluşturuldu
- Tablolar: `users`, `refresh_tokens`
- Unique index'ler: `username`, `email`, `token`
- Seed: SystemAdmin kullanıcı

---

## Test Senaryoları

### Postman ile Test
1. **Register:** `POST http://localhost:5001/api/v1/auth/register`
```json
{
  "username": "testuser",
  "email": "test@sigortak.dev",
  "password": "Test1234!",
  "firstName": "Test",
  "lastName": "Kullanıcı"
}
```

2. **Login:** `POST http://localhost:5001/api/v1/auth/login`
```json
{
  "username": "testuser",
  "password": "Test1234!"
}
```

3. **Protected:** `GET http://localhost:5001/api/v1/users` (Header: `Authorization: Bearer <token>`)

---

## Sonraki Sprint (Sprint 2)
- Vehicle Service (Araç CRUD + OCR entegrasyonu)
- Policy Service (Poliçe ekleme/yenileme/iptal)
- Kafka Consumer'lar (Event → Read Model sync)
- Angular 18 Web Panel (Dashboard MVP)
