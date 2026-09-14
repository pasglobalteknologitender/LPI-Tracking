# LPI Tracking System

Sistem pelacakan pengiriman laut untuk **Link Pasific Logistics** (Link Pasific Indonusa). Aplikasi ini membantu tim operasional melihat status shipment, memperbarui perjalanan kargo, mengelola akun pengguna, dan memantau log integrasi ke penyedia pelacakan TransVoyant.

Proyek ini adalah monorepo: antarmuka web (Next.js) dan REST API (Fastify) berbagi skema data, kontrak API, dan klien TransVoyant yang sama.

---

## Apa yang dikerjakan aplikasi ini?

Dalam logistik laut, satu pengiriman melewati banyak tahap: booking, muat di pelabuhan asal (POL), berlayar, tiba di pelabuhan tujuan (POD), bea cukai, hingga kontainer kosong dikembalikan. Tanpa sistem terpusat, informasi itu tersebar dan sulit diawasi.

LPI Tracking System menampilkan shipment dalam satu portal. Pengguna masuk sesuai peran, melihat daftar dan detail pengiriman, menandai milestone yang sudah selesai, dan (untuk admin) mengelola akun staf.

---

## Fitur utama

- **Login dan sesi aman** — autentikasi dengan email dan kata sandi; token disimpan di cookie HttpOnly, bukan di `localStorage`.
- **Tiga peran pengguna**
  - **Viewer** — melihat shipment dan log
  - **Operator** — ditambah unggah, memperbarui milestone, dan sinkronisasi
  - **Admin** — semua izin operator plus pengelolaan pengguna
- **Daftar shipment** — pencarian (referensi, BOL, kontainer), filter jenis pergerakan (D2D / D2P), jenis kargo (FCL / LCL), dan status; tampilan tabel di desktop dan kartu di layar kecil.
- **Detail shipment** — data kapal/kontainer, timeline 11 milestone (dari *Booking Confirmation* sampai *Empty Container Returned*), dan pembaruan milestone oleh operator/admin.
- **Manajemen pengguna** — admin dapat menambah, mengubah, dan menghapus pengguna (peran admin, operator, viewer; status aktif/nonaktif).
- **Log TransVoyant** — riwayat pengiriman data integrasi (sukses/gagal) beserta payload permintaan dan respons.
- **Unggah CSV** — halaman preview impor file. Saat ini preview memakai data contoh di frontend; impor belum tersimpan ke database melalui API.
- **Desain responsif** — sidebar, daftar, dan formulir menyesuaikan layar desktop dan ponsel.

---

## Tech stack

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Radix UI |
| Backend | Fastify 5 |
| Database | PostgreSQL 16, Drizzle ORM |
| Validasi & kontrak | Zod (`@lpi/contracts`) |
| Autentikasi | JWT (`jose`), cookie HttpOnly, hashing kata sandi Argon2 |
| Integrasi | Paket `@lpi/transvoyant` (klien HTTP dan mock, OAuth `client_credentials`) |
| Pengujian | Vitest (unit), Playwright (E2E) |
| Infrastruktur | Docker, Docker Compose, npm workspaces |

---

## Struktur proyek

```
apps/
  web/              Dashboard Next.js (port 3100)
  api/              REST API Fastify (port 3001)
packages/
  contracts/        Skema Zod, enum, dan mapper bersama
  database/         Drizzle schema, migrasi, dan seed
  transvoyant/      Klien TransVoyant (mock / HTTP) dan OAuth token
```

Browser memanggil `/api/v1/*` di origin web. Next.js meneruskan permintaan itu ke API melalui rewrite (`API_URL`), sehingga cookie autentikasi tetap same-origin.

---

## Prasyarat

- Node.js 20 (image Docker memakai `node:20`)
- npm (lockfile: `package-lock.json`)
- Docker Desktop — untuk PostgreSQL lokal atau deploy penuh

Untuk pengujian E2E, pasang browser Playwright:

```bash
npx playwright install
```

---

## Instalasi dan setup

```bash
# 1. Pasang dependensi
npm install

# 2. Salin file environment
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env

# 3. Jalankan PostgreSQL
docker compose up -d

# 4. Migrasi + data contoh
npm run db:setup

# 5. Jalankan aplikasi (dua terminal)
npm run dev:api   # http://localhost:3001
npm run dev       # http://localhost:3100
```

Buka [http://localhost:3100](http://localhost:3100). Halaman awal mengarahkan ke `/shipments` (setelah login).

### Akun development (seed)

| Peran    | Email                 | Kata sandi   |
|----------|-----------------------|--------------|
| Admin    | admin@example.com     | admin123     |
| Operator | operator@example.com  | operator123  |
| Viewer   | viewer@example.com    | viewer123    |

Akun ini hanya untuk lingkungan lokal. Ganti rahasia JWT di `.env` sebelum dipakai di luar development.

---

## Variabel lingkungan

Salin dari `.env.example`. Nilai di bawah adalah default development.

| Variabel | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_APP_URL` | URL aplikasi web (origin yang diizinkan CORS), default `http://localhost:3100` |
| `API_URL` | Origin API untuk rewrite Next.js, default `http://127.0.0.1:3001` |
| `API_PORT` / `API_HOST` | Port dan host Fastify (`3001` / `0.0.0.0`) |
| `NODE_ENV` | `development` atau `production` |
| `DATABASE_URL` | Koneksi PostgreSQL, contoh `postgresql://lpi:lpi@localhost:5432/lpi_tracking` |
| `JWT_ACCESS_SECRET` | Rahasia JWT access token (minimal 32 karakter) |
| `JWT_REFRESH_SECRET` | Rahasia JWT refresh token |
| `COOKIE_SECURE` | `true` agar cookie hanya dikirim lewat HTTPS |
| `FILE_STORAGE_PATH` | Path penyimpanan file (dipakai volume Docker deploy) |
| `TRANSVOYANT_MODE` | `mock` (default, tanpa panggilan vendor) atau `http` |
| `TRANSVOYANT_BASE_URL` | Base URL API TransVoyant |
| `TRANSVOYANT_TOKEN_URL` | URL OAuth token |
| `TRANSVOYANT_CLIENT_ID` / `TRANSVOYANT_CLIENT_SECRET` | Kredensial OAuth (wajib jika mode `http`) |
| `TRANSVOYANT_TIMEOUT_MS` | Timeout permintaan HTTP, default `15000` |
| `WORKER_CONCURRENCY` | Concurrency default di konfigurasi klien TransVoyant |

Mode `http` ditolak jika `CLIENT_ID` atau `CLIENT_SECRET` kosong, agar kredensial tidak terlewat.

Pada `docker-compose.deploy.yml`, `DATABASE_URL` di dalam kontainer API menjadi `postgresql://lpi:lpi@postgres:5432/lpi_tracking` dan `API_URL` web menjadi `http://api:3001`.

---

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Next.js di port 3100 |
| `npm run dev:api` | Fastify dengan hot reload (`tsx watch`) |
| `npm run build` | Production build web |
| `npm run build:api` | Typecheck API |
| `npm run start` | Jalankan web hasil build |
| `npm run lint` | ESLint di workspace yang memilikinya |
| `npm run typecheck` | TypeScript di semua workspace |
| `npm run test` | Unit test Vitest |
| `npm run test:watch` | Vitest mode watch |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:e2e:ui` | Playwright UI |
| `npm run test:e2e:headed` | Playwright headed |
| `npm run test:e2e:report` | Tampilkan laporan HTML Playwright |
| `npm run db:generate` | Generate migrasi Drizzle |
| `npm run db:migrate` | Jalankan migrasi |
| `npm run db:seed` | Isi data development |
| `npm run db:setup` | Migrasi + seed |

---

## Arsitektur

```
  Browser
     │
     ▼
  Next.js (:3100)  ──rewrite /api/v1/*──►  Fastify (:3001)
  apps/web                                   apps/api
                                                 │
                         ┌───────────────────────┼───────────────────────┐
                         ▼                       ▼                       ▼
                   PostgreSQL              @lpi/database           @lpi/contracts
                   (:5432)                 (Drizzle)               (Zod schema)
                                                 │
                                                 ▼
                                          @lpi/transvoyant
                                          (klien mock / HTTP)
```

**Alur autentikasi.** Login mengembalikan access token (berlaku 15 menit) dan refresh token (7 hari). Keduanya disetel sebagai cookie HttpOnly (`lpi_access_token`, `lpi_refresh_token`). Refresh token disimpan di database dalam bentuk hash SHA-256. Mutasi (POST/PATCH/DELETE) memeriksa header `Origin` agar sesuai `NEXT_PUBLIC_APP_URL`. Endpoint juga menerima `Authorization: Bearer`.

**Data shipment.** Tabel mencakup shipment, kontainer, dan milestone. Status sinkronisasi diturunkan dari catatan `integration_deliveries`. Skema juga sudah menyiapkan tabel impor CSV, file, dan audit log.

**TransVoyant.** Paket `@lpi/transvoyant` menyediakan `MockTransVoyantClient` dan `HttpTransVoyantClient` (OAuth, `PATCH /shipments/attributes`, `POST /shipments/events`). Klien ini siap dipakai; worker latar belakang yang mengirim event ke vendor belum menjadi proses tersendiri di API.

---

## Endpoint API

Prefix: `/api/v1`. Respons memakai bentuk `{ success, message, data, meta? }`.

| Method | Path | Izin |
|--------|------|------|
| POST | `/api/v1/auth/login` | Publik |
| GET | `/api/v1/auth/me` | Cookie atau Bearer |
| POST | `/api/v1/auth/refresh` | Refresh cookie |
| POST | `/api/v1/auth/logout` | Refresh cookie |
| GET | `/api/v1/shipments` | `view_shipments` |
| GET | `/api/v1/shipments/:shipmentId` | `view_shipments` |
| PATCH | `/api/v1/shipments/:shipmentId/milestones/:milestoneId` | `update_milestone` |
| GET | `/api/v1/users` | `manage_users` |
| POST | `/api/v1/users` | `manage_users` |
| PATCH | `/api/v1/users/:userId` | `manage_users` |
| DELETE | `/api/v1/users/:userId` | `manage_users` |
| GET | `/api/v1/logs` | `view_logs` |
| GET | `/health/live` | Publik |
| GET | `/health/ready` | Publik (cek database) |

---

## Pengujian

```bash
# Unit test
npm run test

# E2E (butuh PostgreSQL + seed)
docker compose up -d
npm run db:setup
npm run test:e2e
```

Unit test mencakup mapper kontrak, mapper log API, dan mapper TransVoyant. E2E (Playwright) mencakup login, navigasi, izin peran, daftar dan detail shipment, unggah, pengguna, log, dan tampilan mobile.

---

## Deploy dengan Docker

```bash
cp .env.example .env
docker compose -f docker-compose.deploy.yml up -d --build
```

Compose ini menjalankan PostgreSQL, API, dan web. API menjalankan migrasi saat start. Aplikasi: [http://localhost:3100](http://localhost:3100).

Untuk development, tetap pakai `docker compose up -d` (hanya PostgreSQL), lalu `npm run dev` dan `npm run dev:api`.

---

## Keamanan

- Jangan commit `.env`. Gunakan `.env.example` sebagai template.
- Token autentikasi di cookie HttpOnly (`SameSite=Lax`).
- Refresh token di-hash di database; kata sandi di-hash dengan Argon2.
- Logger Fastify meredact header `authorization`/`cookie` dan field password.

---

Proyek privat (`private: true`) — penggunaan internal Link Pasific Logistics.
