# 🚗 Sigortak — Akıllı Araç & Poliçe Yönetim Platformu

**Sigortak**, kurumsal filolar ve sigorta acenteleri için tasarlanmış, **CQRS**, **Event-Driven Architecture (Olay Güdümlü Mimari)** ve **Mikroservis** prensipleriyle geliştirilmiş uçtan uca bir B2B SaaS araç ve poliçe takip platformudur.

Platform; zorunlu trafik sigortası, kasko ve TÜVTÜRK muayenelerini tek bir uyumluluk (compliance) merkezinden yönetmenize olanak tanır. Akıllı OCR entegrasyonu sayesinde yüklenen poliçe PDF dosyalarından veri alanlarını otomatik ayrıştırır, komisyon/prim ödemelerini takip eder ve yaklaşan vadeler için otomatik hatırlatmalar sunar.

---

## 🏗️ Sistem Mimarisi ve Akış Diyagramı

Platform, yüksek ölçeklenebilirlik sağlamak amacıyla **Komut (Command)** ve **Sorgu (Query)** veri modellerini birbirinden ayırır (CQRS). Veri tutarlılığı, mikroservisler arasında Kafka ve RabbitMQ aracılığıyla asenkron olarak sağlanır.

```
                            ┌────────────────────────┐
                            │ React + Vite (Frontend) │
                            │     (Nginx - :80)      │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │    YARP API Gateway    │
                            │        (:5000)         │
                            └───────────┬────────────┘
                                        │
      ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
      ▼                  ▼              ▼              ▼                  ▼
┌───────────┐      ┌───────────┐  ┌───────────┐  ┌───────────┐      ┌───────────┐
│ Identity  │      │  Vehicle  │  │  Policy   │  │   Quote   │      │ WorkOrder │
│    API    │      │    API    │  │    API    │  │    API    │      │    API    │
│  (:5001)  │      │  (:5002)  │  │  (:5003)  │  │  (:5005)  │      │  (:5004)  │
└─────┬─────┘      └─────┬─────┘  └─────┬─────┘  └─────┬─────┘      └─────┬─────┘
      │                  │              │              │                  │
      └─────────┬────────┴──────────────┼──────────────┴──────────────────┘
                │                       ▼
                │             ┌──────────────────┐
                │             │    OCR Worker    │ <─── [Python OCR Service]
                │             │  (Async - :5006) │
                │             └────────┬─────────┘
                ▼                      │
      ┌──────────────────┐             │
      │    RabbitMQ      │ <───────────┘ (Asenkron İş Emirleri)
      │  (Command Bus)   │
      └────────┬─────────┘
                │
                ▼
      ┌──────────────────┐
      │  Apache Kafka    │ (Olay Güdümlü Senkronizasyon)
      │   (Event Bus)    │
      └────────┬─────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
  ┌───────────┐   ┌───────────┐
  │ Write DB  │   │  Read DB  │ <─── [Redis Cache]
  │ (Postgres)│   │ (Postgres)│
  └───────────┘   └───────────┘
```

---

## 🛡️ Teknoloji Yığını (Technology Stack)

- **Backend:** .NET 10.0, ASP.NET Core Web API
- **Frontend:** React (Vite, TypeScript, HTML5, Vanilla CSS, FontAwesome)
- **Veritabanları (CQRS Segmentasyonu):**
  - **Write DB:** PostgreSQL 16 (İşlemler, ilişkiler ve ana kayıtlar)
  - **Read DB:** PostgreSQL 16 (Hızlı okuma, arama ve müşteri listeleri)
- **Önbellekleme:** Redis 7 (Hızlı araç detayları ve oturum verileri)
- **Kuyruk ve Mesajlaşma:**
  - **RabbitMQ 3:** Komutların ve asenkron operasyonların kuyruğa alınması
  - **Apache Kafka:** Servisler arası gerçek zamanlı veri eşitleme (Event Sourcing)
- **Dosya Depolama:** MinIO S3 Object Storage (Poliçe ve muayene PDF belgeleri)
- **OCR Engine:** Python Flask (Tesseract OCR + Regex parsing) & C# Background Service

---

## 📁 Proje Klasör Yapısı

```
Sigortak/
├── docker-compose.yml              # Tüm altyapıyı tek tıkla kaldıran Docker dosyası
├── README.md                       # Bu döküman
├── src/
│   ├── ApiGateway/
│   │   └── Sigortak.Gateway/       # YARP Reverse Proxy & Gateway
│   ├── BuildingBlocks/
│   │   ├── Sigortak.Common/        # Result pattern, Base Entities, Exceptions
│   │   ├── Sigortak.CQRS/          # MediatR CQRS Boru Hatları & Validasyon Davranışları
│   │   └── Sigortak.EventBus/      # Kafka ve RabbitMQ entegrasyon altyapısı
│   ├── Services/
│   │   ├── Identity/               # Kullanıcı rol, yetki ve Tenant yönetimi (:5001)
│   │   ├── Vehicle/                # Araç kaydı, TÜVTÜRK uyum ve risk kontrolü (:5002)
│   │   ├── Policy/                 # Poliçe arşivi, MinIO yükleme ve vade yönetimi (:5003)
│   │   ├── WorkOrder/              # Hasar dosyası, Eksper ve Tahsilat iş emirleri takip (:5004)
│   │   ├── Quote/                  # Toplu ve tekil kasko/trafik teklif toplama (:5005)
│   │   └── Ocr/
│   │       ├── Sigortak.Ocr.API/    # Python Flask OCR Servisi
│   │       └── Sigortak.Ocr.Worker/ # OCR okuma kuyruğu ve veri çıkarma işçisi (:5006)
│   └── Web/                        # React + TypeScript SPA Arayüzü (Vite)
```

---

## 🚀 Hızlı Başlangıç (Local Deployment)

### Gereksinimler
- Docker ve Docker Compose
- .NET 10.0 SDK (Eğer lokalde çalıştırmak isterseniz)

### 1. Sistemi Tek Komutla Çalıştırma
Projenin kök dizininde terminali açarak aşağıdaki komutu çalıştırın:
```bash
docker-compose up -d --build
```
Bu komut veritabanlarını, mesaj kuyruklarını, API servislerini ve web arayüzünü otomatik derler ve başlatır.

### 2. Uygulama Port Haritası & Arayüzler

| Servis / Panel | URL | Tanım / Kullanım |
|----------------|-----|------------------|
| **Sigortak Arayüzü** | [http://localhost](http://localhost) | React Portalı (Nginx üzerinde çalışır) |
| **API Gateway** | [http://localhost:5000](http://localhost:5000) | YARP Reverse Proxy giriş kapısı (Kimlik Doğrulama & Hız Sınırlama) |
| **Seq (Observability)** | [http://localhost:5341](http://localhost:5341) | Merkezi loglama ve dağıtık izleme (Trace/Correlation ID) paneli |
| **pgAdmin 4** | [http://localhost:5050](http://localhost:5050) | Postgres Veritabanı Yönetimi |
| **RabbitMQ Management** | [http://localhost:15672](http://localhost:15672) | Kuyruk durumu ve mesaj izleme (sigortak / sigortak) |
| **Kafka UI** | [http://localhost:8090](http://localhost:8090) | Servisler arası Kafka event'lerini izleme |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | S3 poliçe ve muayene PDF dosyalarını inceleme |

---

## 📦 Mikroservis Modülleri ve Detayları

### 🔑 1. Identity (Kimlik) Servisi
Kullanıcıların sisteme giriş, kayıt ve yetkilendirme süreçlerini yönetir.
- **Teknoloji:** ASP.NET Core Identity, JWT Token, Multi-Tenant Ayrıştırma.

### 🚗 2. Vehicle (Araç & Uyum) Servisi
Filo araçlarının kaydını tutar, muayene tarihlerini saklar ve uyumluluk (compliance) analizleri üretir.
- **TÜVTÜRK Uyum Kontrolü:** Muayenesi girilmemiş veya süresi dolmuş araçlar için arayüzde ve detay modalında kırmızı renkte **Kritik Risk ve Hasar Ödemesi Ret Riski** uyarıları fırlatır.

### 📄 3. Policy (Poliçe & Ödeme) Servisi
Poliçe verilerini ve dosyalarını saklar.
- **Ödeme Durumu Takibi:** Komisyon, prim ve vergi takibi yapar. Acente arayüzünden poliçeler "Ödendi/Ödenmedi" olarak işaretlenebilir, ödeme tarihleri ve notları izlenebilir.

### 👁️ 4. OCR Worker (Yapay Zeka ve PDF Okuma) Servisi
Yüklenen poliçe PDF belgelerini asenkron olarak analiz eder.
- **Süreç:** Kullanıcı PDF yüklediğinde dosya MinIO S3'e yüklenir ve RabbitMQ'ya olay atılır. OCR Worker Python servisini tetikleyerek plaka, T.C. kimlik no, sigortalı adı, acente bilgisi, IMM limiti, prim ve vade tarihlerini çıkarır ve aracı/poliçeyi otomatik kaydeder.

### 📝 5. WorkOrder (İş Emirleri) Servisi
Operasyonel süreçleri koordine eder:
- Hasar dosyası açma, Eksper atama, Poliçe yenileme ve Tahsilat/İptal iş emirlerini öncelik derecesine (Düşük, Orta, Yüksek, Kritik) göre takip eder.

---

## 💻 Geliştirici Kılavuzu & Veritabanı Migration İşlemleri

Yeni bir kolon veya tablo eklendiğinde lokal makinada migration uygulamak için aşağıdaki komutları kullanabilirsiniz.

### Write (Ana) Veritabanı Migration Ekleme
```bash
dotnet ef migrations add [MigrationName] --project src\Services\Policy\Sigortak.Policy.Infrastructure --startup-project src\Services\Policy\Sigortak.Policy.API
```

### Read (Okuma) Veritabanı Migration Ekleme
```bash
dotnet ef migrations add [MigrationName] --project src\Services\Vehicle\Sigortak.Vehicle.Infrastructure --startup-project src\Services\Vehicle\Sigortak.Vehicle.API --context ReadDbContext
```

### Değişiklikleri Docker Üzerine Yansıtma
Kod değişiklikleri sonrası ilgili servisi docker üzerinde yeniden derlemek için:
```bash
docker-compose up -d --build [service-name]
# Örnek: docker-compose up -d --build vehicle-api
```

---

## 🔒 Güvenlik, Hata Toleransı & İzlenebilirlik (Observability)

### 1. Gateway Üzerinde Güvenlik ve Hız Sınırlama (Authentication & Rate Limiting)
- **Kimlik Doğrulama:** Gateway, downstream mikroservisleri korumak amacıyla merkezi JWT token doğrulamasını (`AuthorizationPolicy`) üstlenir. Yetkisiz istekler doğrudan `401 Unauthorized` ile Gateway seviyesinde engellenir.
- **Hız Sınırlama (Rate Limiting):** İstek sıklığı kontrolü (`api-limiter`) ile API Gateway üzerinde saniyede belirli sayıda istek sınırı (Pencere başına 50 istek, kuyruk sınırı 10) uygulanır. Sınır aşımında istekler mikroservislere ulaştırılmadan doğrudan `429 Too Many Requests` olarak reddedilir.

### 2. Hata Toleransı ve DLQ (Resilience & Dead Letter Queue)
- **Polly Retry Policy:** Veritabanı kesintileri veya ağ gecikmeleri gibi geçici hatalarda mesaj kaybını önlemek için asenkron tüketicilerde (RabbitMQ ve Kafka) **3 kez üstel gecikmeli (2s, 4s, 8s)** yeniden deneme politikası çalıştırılır.
- **Dead Letter Queue (DLQ):** Yeniden deneme limitleri aşıldığında veya deserialization hatası gibi kalıcı problemlerde mesajlar `BasicNack(requeue: false)` ile doğrudan `{QueueName}.dlq` adlı hata kuyruğuna aktarılır. Bu sayede ana işlem kuyruğunun tıkanması engellenir.

### 3. Merkezi Loglama ve Dağıtık İzleme (Centralized Logging & Tracing)
- **Merkezi Seq Entegrasyonu:** Tüm mikroservisler ve API Gateway loglarını HTTP protokolü üzerinden merkezi **Datalust Seq** (`http://localhost:5341`) sunucusuna gönderir.
- **Dağıtık İstek Takibi:** İstekler API Gateway'den başlayarak mikroservislere ve asenkron kuyruk akışlarına kadar .NET'in yerleşik W3C `TraceId` standardı ile işaretlenir. Seq paneli üzerinden tek bir `TraceId` filtresi ile uçtan uca istek yaşam döngüsü (Gateway -> API -> EventBus -> Worker) görselleştirilebilir.
