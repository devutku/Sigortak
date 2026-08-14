# 🚗 Sigortak — Araba Sigorta Takip Sistemi

**CQRS + Event-Driven Architecture + Microservices** ile araç poliçelerinin ve operasyonel iş emirlerinin uçtan uca yönetimi.

---

## 🏗️ Mimari Yapı

```
                     ┌───────────────┐
                     │ React + Vite  │
                     │  (Frontend)   │
                     └───────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Gateway   │
                    │ (YARP - :5000)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  Identity   │     │   Vehicle   │     │   Policy    │
  │ API (:5001) │     │ API (:5002) │     │ API (:5003) │
  └─────────────┘     └─────────────┘     └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  WorkOrder  │
                                          │ API (:5004) │
                                          └─────────────┘
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
* Docker & Docker Compose
* .NET 10.0 SDK

### 1. Tüm Sistemi Başlat (Veritabanları, Kafka, Redis ve API'ler)
```bash
docker-compose up -d --build
```
Bu komut; PostgreSQL, Kafka, RabbitMQ, Redis, MinIO ve tüm API servisleri ile birlikte React Frontend arayüzünü ayağa kaldırır.

### 2. Uygulama Panelleri & Portlar
| Servis | URL | Açıklama |
|--------|-----|----------|
| **Frontend Web** | http://localhost:80 | React Sigortak Web Arayüzü |
| **API Gateway** | http://localhost:5000 | YARP Gateway Girişi |
| **Identity API** | http://localhost:5001 | Kullanıcı Yetkilendirme Servisi |
| **Vehicle API** | http://localhost:5002 | Araç Kayıt ve Takip Servisi |
| **Policy API** | http://localhost:5003 | Poliçe Dosyalama ve OCR Servisi |
| **WorkOrder API**| http://localhost:5004 | Operasyonel İş Emirleri Servisi |
| **pgAdmin** | http://localhost:5050 | PostgreSQL Yönetim Arayüzü |
| **RabbitMQ** | http://localhost:15672 | Kuyruk ve Komut Tüketim Arayüzü |
| **Kafka UI** | http://localhost:8090 | Kafka Event İzleme Arayüzü |
| **MinIO Console**| http://localhost:9001 | S3 Depolama Yönetim Arayüzü |

---

## 📁 Proje Yapısı

```
src/
├── ApiGateway/
│   └── Sigortak.Gateway/          # YARP Reverse Proxy & Gateway
├── BuildingBlocks/
│   ├── Sigortak.Common/           # Result pattern, Base Entities, Exceptions
│   ├── Sigortak.CQRS/             # MediatR CQRS Pipelines & Behaviors
│   └── Sigortak.EventBus/         # RabbitMQ + Kafka Ortak İletişim Altyapısı
├── Web/                           # React + Vite + TypeScript Frontend
└── Services/
    ├── Identity/                  # Kimlik ve Rol Yönetimi (:5001)
    ├── Vehicle/                   # Araç Kayıt ve Takip Servisi (:5002)
    ├── Policy/                    # Poliçe ve MinIO PDF Depolama Servisi (:5003)
    └── WorkOrder/                 # Hasar Dosyası, Eksper ve Tahsilat İş Emirleri Servisi (:5004)
```

---

## 🔑 Önemli API Endpoints

### 1. Kimlik ve Giriş İşlemleri (Auth)
* `POST /api/v1/auth/login` — Kullanıcı girişi (JWT)
* `POST /api/v1/auth/register` — Yeni kullanıcı kaydı

### 2. Araç İşlemleri (Vehicles)
* `GET /api/v1/vehicles` — Araç listesini getirir
* `POST /api/v1/vehicles` — Yeni araç kaydeder
* `GET /api/v1/vehicles/{id}` — Araç detay bilgilerini getirir

### 3. Poliçe İşlemleri (Policies)
* `POST /api/v1/policies` — Yeni poliçe dosyası ekler (MinIO S3 üzerine yüklenir)
* `POST /api/v1/policies/renew` — Poliçe yenileme işlemi yapar

### 4. İş Emirleri İşlemleri (Work Orders)
* `GET /api/v1/workorders` — Aktif ve geçmiş tüm iş emirlerini listeler
* `POST /api/v1/workorders` — Yeni iş emri oluşturur (Hasar, Eksper, Yenileme vb.)
* `PUT /api/v1/workorders/status` — İş emrinin durumunu günceller (İşlemde, Tamamlandı, İptal)

---

## 🛡️ Teknoloji Stack

* **Backend Framework:** .NET 10.0, ASP.NET Core
* **Veritabanı (Write/Read):** PostgreSQL 16
* **Kuyruk / Mesajlaşma:** RabbitMQ 3 & Apache Kafka (KRaft mode)
* **Önbellekleme:** Redis 7
* **Dosya Depolama:** MinIO S3 Object Storage
* **Frontend:** React, TypeScript, Vite, Nginx (Dockerized)
* **Gateway:** YARP Reverse Proxy
