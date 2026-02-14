# Pizza Delivery Dashboard - Technical Planning Document

## 1. System Overview

### 1.1 Project Description

**Pizza Delivery Dashboard** adalah aplikasi web untuk monitoring dan analisis data delivery pizza. Sistem ini memungkinkan pengguna untuk mengupload data delivery, melihat visualisasi analytics, dan mengelola user/staff berdasarkan role masing-masing.

### 1.2 Business Context

Sistem ini dirancang untuk:
- Melacak performa delivery beberapa restoran pizza
- Menganalisis faktor-faktor yang mempengaruhi waktu delivery
- Mengelola data delivery dari berbagai sumber (Excel/CSV)
- Memberikan akses berdasarkan role (GM, Admin, Manager, Staff)

---

## 2. Features

### 2.1 Authentication & Authorization

| Feature | Description |
|---------|-------------|
| Login | Username/email dengan password |
| Session Management | JWT token dengan expiry 30 menit |
| Role-based Access | GM, ADMIN_PUSAT, MANAGER, ASISTEN_MANAGER, STAFF |
| Auto Logout | Session timeout setelah 30 menit tidak aktif |

### 2.2 Data Management

| Feature | Description |
|---------|-------------|
| Upload Excel/CSV | Upload file data delivery dengan validasi |
| Data Cleansing | Otomatis membersihkan dan validasi data |
| Manual Mapping | Mapping kolom Excel ke database fields |
| Data Validation | Validasi format, range, dan kelengkapan data |
| Quality Score | Skor kualitas data per upload |

### 2.3 Dashboard & Analytics

| Feature | Description |
|---------|-------------|
| Real-time Charts | Visualisasi data delivery dengan Recharts |
| Orders by Month | Grafik jumlah order per bulan |
| Pizza Size Distribution | Distribusi ukuran pizza |
| Traffic Impact | Analisis dampak lalu lintas terhadap delivery |
| Peak Hours Analysis | Analisis jam sibuk |
| Delivery Performance | Perbandingan on-time vs delayed |
| Payment Methods | Statistik metode pembayaran |
| Weekend vs Weekday | Analisis hari kerja vs akhir pekan |

### 2.4 User Management (GM & Admin Only)

| Feature | Description |
|---------|-------------|
| Create User | Tambah user baru dengan role tertentu |
| Edit User | Ubah data user |
| Deactivate User | Nonaktifkan user |
| Role Assignment | Assign role: GM, ADMIN_PUSAT, MANAGER, STAFF |

### 2.5 Staff Management (Manager+)

| Feature | Description |
|---------|-------------|
| View Staff | Lihat staff per restoran |
| Add Staff | Tambah staff baru |
| Edit Staff | Ubah data staff |
| Assign Restaurant | Assign staff ke restoran tertentu |

### 2.6 Restaurant Management (GM & Admin)

| Feature | Description |
|---------|-------------|
| Create Restaurant | Tambah restoran baru |
| Edit Restaurant | Ubah informasi restoran |
| View Restaurant | Lihat detail restoran |
| Manage Locations | Kelola lokasi restoran |

### 2.7 Settings

| Feature | Description |
|---------|-------------|
| Profile Settings | Ubah nama dan email |
| Password Change | Ganti password |

---

## 3. Tech Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework dengan App Router |
| **React** | 19.2.3 | UI Library |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **Recharts** | 3.7.0 | Chart visualization |
| **Lucide React** | 0.563.0 | Icon library |
| **React Hook Form** | 7.71.1 | Form management |
| **Zod** | 4.3.6 | Schema validation |
| **Zustand** | 5.0.11 | State management |
| **PapaParse** | 5.5.3 | CSV parsing |
| **XLSX** | 0.18.5 | Excel file parsing |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.1.6 | Backend API endpoints |
| **NextAuth.js** | 4.24.13 | Authentication |
| **Prisma** | 5.22.0 | ORM untuk database |
| **bcryptjs** | 3.0.3 | Password hashing |

### 3.3 Database

| Technology | Purpose |
|------------|---------|
| **SQL Server** | Primary database |
| **Prisma Client** | ORM untuk query builder |

### 3.4 Development Tools

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type-safe JavaScript |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Turbopack** | Next.js bundler |

---

## 4. Data Flow

### 4.1 Upload Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Upload   │ ──▶ │   Client Parse   │ ──▶ │   Data Cleansing│
│  Excel/CSV File │     │   (XLSX Library) │     │   (Validation)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Save to DB    │ ◀── │   API Response   │ ◀── │   Upsert Data   │
│  (Prisma)       │     │   (Success/Error)│     │   (Business Log)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 4.2 Authentication Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Login Form  │ ──▶ │  Validate Creds │ ──▶ │  Generate JWT    │
└──────────────┘     │  (bcrypt)       │     │  (NextAuth)      │
                     └─────────────────┘     └──────────────────┘
                                                        │
                                                        ▼
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Redirect to │ ◀── │  Store Session  │ ◀── │  Return User     │
│  Dashboard   │     │  (Cookie)       │     │  Data + Token    │
└──────────────┘     └─────────────────┘     └──────────────────┘
```

### 4.3 Dashboard Data Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Dashboard   │ ──▶ │  API Charts     │ ──▶ │  Query Database  │
│  Page Load   │     │  Route          │     │  (Prisma)        │
└──────────────┘     └─────────────────┘     └──────────────────┘
                                                        │
                                                        ▼
                     ┌─────────────────┐     ┌──────────────────┐
                     │  Return JSON    │ ◀── │  Aggregation     │
                     │  Data           │     │  Queries         │
                     └─────────────────┘     └──────────────────┘
```

### 4.4 Role-based Access Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  User Login  │ ──▶ │  Get User Role │ ──▶ │  Store in JWT    │
│              │     │  from DB        │     │  Session         │
└──────────────┘     └─────────────────┘     └──────────────────┘
                                                        │
                                                        ▼
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Protected   │ ──▶ │  Middleware     │ ──▶ │  Check Role      │
│  Route       │     │  Check          │     │  Authorization   │
└──────────────┘     └─────────────────┘     └──────────────────┘
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────┐       ┌───────────────┐       ┌────────────────┐
│    User     │       │  Restaurant   │       │  DeliveryData  │
├─────────────┤       ├───────────────┤       ├────────────────┤
│ id          │◀──────│ id            │◀──────│ restaurantId   │
│ email       │       │ name          │       │ orderId        │
│ password    │       │ code         │       │ location        │
│ name        │       │ location      │       │ orderTime       │
│ role        │       │ description   │       │ deliveryTime    │
│ position    │       │ isActive      │       │ pizzaSize       │
│ restaurantId│──────▶│ createdAt     │       │ pizzaType       │
│ isActive    │       └───────────────┘       │ distanceKm      │
│ createdAt   │                                 │ trafficLevel    │
└─────────────┘                                 │ isDelayed       │
                                                └────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌────────────────┐
│   AuditLog      │                           │ Notification   │
├─────────────────┤                           ├────────────────┤
│ userId          │                           │ userId         │
│ action          │                           │ type           │
│ entity          │                           │ title          │
│ entityId        │                           │ message        │
│ restaurantId    │                           │ isRead         │
│ timestamp       │                           └────────────────┘
└─────────────────┘
```

### 5.2 Model Definitions

#### User Model
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  role          String    @default("STAFF")     // GM, ADMIN_PUSAT, MANAGER, ASISTEN_MANAGER, STAFF
  position      String    @default("STAFF")
  restaurantId  String?
  restaurant    Restaurant? @relation(fields: [restaurantId], references: [id])
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLogin     DateTime?
  sessions      Session[]
  auditLogs     AuditLog[]
  notifications Notification[]
}
```

#### Restaurant Model
```prisma
model Restaurant {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique
  location    String?
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users          User[]
  deliveryData   DeliveryData[]
}
```

#### DeliveryData Model
```prisma
model DeliveryData {
  id                    String   @id @default(uuid())
  orderId               String   @unique
  restaurantId          String
  restaurant            Restaurant @relation(fields: [restaurantId], references: [id])
  
  location              String
  orderTime             DateTime
  deliveryTime          DateTime
  deliveryDuration      Int
  orderMonth           String
  orderHour            Int
  
  pizzaSize             String
  pizzaType             String
  toppingsCount         Int
  pizzaComplexity       Int
  toppingDensity        Float?
  
  distanceKm            Float
  trafficLevel          String
  trafficImpact        Int
  isPeakHour           Boolean
  isWeekend            Boolean
  
  paymentMethod         String
  paymentCategory       String
  estimatedDuration     Float
  deliveryEfficiency   Float?
  delayMin             Float
  isDelayed            Boolean
  
  restaurantAvgTime     Float?
  
  uploadedBy            String
  uploadedAt           DateTime @default(now())
  validatedAt          DateTime?
  validatedBy          String?
  qualityScore         Float?
  version              Int      @default(1)
  
  @@index([restaurantId])
  @@index([orderTime])
  @@index([orderMonth])
  @@index([isDelayed])
}
```

---

## 6. Environment Variables

### 6.1 Required Variables

Buat file `.env` di root project:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# SQL Server Connection String
# Format: sqlserver://host:port;database=name;user=username;password=password;trustServerCertificate=true

DATABASE_URL="sqlserver://localhost:1433;database=pizza_dashboard;user=sa;password=PizzaAdmin123!;trustServerCertificate=true"

# ===========================================
# NEXTAUTH CONFIGURATION
# ===========================================
# URL untuk NextAuth (Ganti dengan domain production)
NEXTAUTH_URL=http://localhost:3001

# Secret key untuk encrypt JWT session
# BIKAN CONTOH - GENERATE RANDOM STRING MIN 32 KARAKTER!
NEXTAUTH_SECRET=super-secret-key-change-in-production-123456789
```

### 6.2 Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | SQL Server connection string | `sqlserver://localhost:1433;database=pizza_dashboard;user=sa;password=PASS;trustServerCertificate=true` |
| `NEXTAUTH_URL` | ✅ | Base URL aplikasi | `http://localhost:3001` atau `https://domain.com` |
| `NEXTAUTH_SECRET` | ✅ | Random string untuk JWT encryption | Minimal 32 karakter acak |

### 6.3 SQL Server Connection Details

```
Host        : localhost
Port        : 1433 (default SQL Server)
Database    : pizza_dashboard
Username    : sa
Password    : (sesuaikan dengan installasi SQL Server Anda)
Trust Cert : true (untuk local development)
```

---

## 7. API Endpoints

### 7.1 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/[...nextauth]` | NextAuth handlers | ❌ |
| POST | `/api/register` | Register user baru | ❌ |

### 7.2 Data Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Upload Excel/CSV | ✅ |
| GET | `/api/upload` | Get restaurants list | ✅ |

### 7.3 Dashboard & Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/charts` | Get all chart data | ✅ |
| GET | `/api/analytics` | Get detailed analytics | ✅ |

### 7.4 User Management

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/users` | List all users | ✅ | GM, ADMIN_PUSAT |
| POST | `/api/users` | Create user | ✅ | GM, ADMIN_PUSAT |
| PUT | `/api/users` | Update user | ✅ | GM, ADMIN_PUSAT |
| DELETE | `/api/users` | Deactivate user | ✅ | GM, ADMIN_PUSAT |

### 7.5 Staff Management

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/staff` | List staff | ✅ | Manager+ |
| POST | `/api/staff` | Add staff | ✅ | Manager+ |
| PUT | `/api/staff` | Update staff | ✅ | Manager+ |
| DELETE | `/api/staff` | Remove staff | ✅ | Manager+ |

### 7.6 Restaurant Management

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/restaurants` | List restaurants | ✅ | GM, ADMIN_PUSAT |
| POST | `/api/restaurants` | Create restaurant | ✅ | GM, ADMIN_PUSAT |
| PUT | `/api/restaurants` | Update restaurant | ✅ | GM, ADMIN_PUSAT |

### 7.7 Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | List orders | ✅ |
| POST | `/api/orders` | Create order | ✅ |
| PUT | `/api/orders` | Update order | ✅ |

### 7.8 History

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/history` | Get upload history | ✅ |

---

## 8. Security Implementation

### 8.1 Authentication Security

| Aspect | Implementation |
|--------|---------------|
| Password Hashing | bcryptjs dengan salt rounds 12 |
| Session Token | JWT dengan expiry 30 menit |
| Session Storage | HTTP-only cookies |
| Password Validation | Required minimal karakter |

### 8.2 Authorization Matrix

| Role | Dashboard | Upload | Analytics | Users | Staff | Restaurants | Settings |
|------|-----------|--------|-----------|-------|-------|-------------|----------|
| GM | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN_PUSAT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| ASISTEN_MANAGER | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| STAFF | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 8.3 API Security

- ✅ Semua API routes memerlukan authentication (kecuali `/api/auth/*` dan `/api/register`)
- ✅ Middleware melindungi route yang memerlukan login
- ✅ Role-based access control di setiap API endpoint
- ✅ Input validation menggunakan Zod

### 8.4 Data Security

- ✅ Prepared statements via Prisma (SQL injection prevention)
- ✅ XSS protection via React
- ✅ CSRF tokens via NextAuth
- ✅ Environment variables untuk secrets

---

## 9. User Roles & Permissions

### 9.1 Role Definitions

| Role | Description | Restaurant Bound |
|------|-------------|------------------|
| **GM** | General Manager - Akses penuh ke semua fitur | ❌ No |
| **ADMIN_PUSAT** | Admin Pusat - Akses penuh ke semua fitur | ❌ No |
| **MANAGER** | Manager Restoran - Akses terbatas per restoran | ✅ Yes |
| **ASISTEN_MANAGER** | Asisten Manager - Upload + Analytics | ✅ Yes |
| **STAFF** | Staff - Upload data saja | ✅ Yes |

### 9.2 Redirect Logic After Login

```
LOGIN ──▶ CHECK ROLE
           │
           ├── GM, ADMIN_PUSAT ──▶ Redirect to: /
           │
           └── MANAGER, ASISTEN_MANAGER, STAFF ──▶ Redirect to: /upload
```

---

## 10. Data Cleansing Logic

### 10.1 Validation Rules

| Field | Validation | Action if Invalid |
|-------|------------|-------------------|
| Order ID | Required, alphanumeric | Generate default ORD{timestamp} |
| Location | Required | Warning, allow save |
| Order Time | Valid datetime | Use current time |
| Delivery Time | Valid datetime | Use current time |
| Pizza Size | Must match: Small, Medium, Large, XL | Set to "Unknown" |
| Pizza Type | Must match predefined list | Set to "Unknown" |
| Distance (km) | Must be numeric ≥ 0 | Set to 0 |
| Traffic Level | Must match: Low, Medium, High | Set to "Unknown" |

### 10.2 Data Enrichment

Sistem secara otomatis menghitung:
- `orderMonth` - Bulan dari orderTime
- `orderHour` - Jam dari orderTime
- `isPeakHour` - TRUE jika jam 11-13 atau 17-20
- `isWeekend` - TRUE jika Saturday/Sunday
- `deliveryDuration` - Selisih deliveryTime - orderTime (menit)
- `delayMin` - Jika deliveryDuration > estimatedDuration
- `isDelayed` - TRUE jika delayMin > 0

---

## 11. Installation Requirements

### 11.1 Software Requirements

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18.x atau 20.x (LTS) | https://nodejs.org/ |
| npm | 9.x atau 10.x | Included with Node.js |
| SQL Server | 2019 atau lebih baru | https://www.microsoft.com/en-us/sql-server/sql-server-downloads |
| Git | 2.x | https://git-scm.com/ |

### 11.2 Database Setup

1. Install SQL Server
2. Buat database: `pizza_dashboard`
3. Konfigurasi user credentials
4. Update `.env` dengan credentials Anda

### 11.3 Initial Setup Commands

```bash
# 1. Clone repository
git clone <repo-url>
cd pizza-dashboard

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Edit file .env dengan credentials Anda

# 4. Generate Prisma Client
npm run db:generate

# 5. Push schema to database
npm run db:push

# 6. (Optional) Seed data
npm run db:seed

# 7. Run development server
npm run dev
```

### 11.4 Default Accounts (After Seed)

| Role | Email | Password |
|------|-------|----------|
| GM | gm@pizza.com | password123 |
| ADMIN_PUSAT | admin@pizza.com | password123 |
| MANAGER (Domino's) | manager@dominos.com | password123 |
| MANAGER (Pizza Hut) | manager@pizzahut.com | password123 |
| ASST_MANAGER | asman@dominos.com | password123 |
| STAFF | staff@dominos.com | password123 |

**CATATAN: Ganti password default setelah login pertama!**

---

## 12. Project Structure

```
pizza-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed data script
├── public/
│   ├── sunest-logo.png       # Logo aplikasi
│   └── ...                   # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/        # Login page
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx      # Main dashboard
│   │   │   ├── upload/       # Upload page
│   │   │   ├── analytics/    # Analytics page
│   │   │   ├── orders/      # Orders page
│   │   │   ├── history/     # History page
│   │   │   ├── users/       # User management
│   │   │   ├── staff/       # Staff management
│   │   │   ├── restaurants/ # Restaurant management
│   │   │   └── settings/    # Settings page
│   │   └── api/             # API routes
│   │       ├── auth/
│   │       ├── upload/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── staff/
│   │       ├── restaurants/
│   │       └── ...
│   ├── components/
│   │   ├── auth/            # Auth components
│   │   ├── charts/          # Chart components
│   │   ├── dashboard/       # Dashboard components
│   │   └── ui/              # UI components
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts         # Utility functions
│   ├── services/
│   │   └── cleansing.ts     # Data cleansing logic
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── middleware.ts         # Auth middleware
├── .env                      # Environment variables
├── package.json              # Dependencies
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── README.md                 # Project README
```

---

## 13. Troubleshooting

### 13.1 Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| Cannot connect to database | SQL Server tidak running / credentials salah | Cek SQL Server dan credentials di .env |
| Prisma Client not generated | `db:generate` belum dijalankan | Jalankan `npm run db:generate` |
| Port already in use | Port 3001 sudah digunakan | Kill process atau gunakan port lain |
| Module not found | Dependencies belum terinstall | Jalankan `npm install` |
| JWT error | NEXTAUTH_SECRET tidak diset | Generate random secret di .env |

### 13.2 Database Reset

```bash
# Hapus database dan buat ulang
npm run db:push -- --force-reset

# Seed ulang data
npm run db:seed
```

---

## 14. Future Enhancements

Potential improvements untuk versi selanjutnya:
- Multi-language support (i18n)
- Real-time notifications
- Export reports (PDF/Excel)
- Advanced filtering & search
- Dark mode theme
- Mobile responsive improvements
- API documentation (Swagger)
- Docker containerization

---

## 15. Conclusion

Pizza Delivery Dashboard adalah sistem yang komprehensif untuk monitoring delivery pizza dengan fitur:
- ✅ Upload dan validasi data otomatis
- ✅ Visualisasi analytics yang kaya
- ✅ Role-based access control yang aman
- ✅ Interface yang user-friendly
- ✅ Tech stack modern dan scalable

Sistem ini siap untuk di-deploy ke production dengan konfigurasi yang sesuai.
