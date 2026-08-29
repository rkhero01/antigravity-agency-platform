# Production Deployment & Database Activation Guide
## Antigravity Agency Management & AI Intelligence Platform

---

### 1. Overview & Operational Architecture
The Antigravity Agency platform is built as a dual-runtime system:
1. **Demo Sandbox Mode (Default)**: Runs completely offline with an in-memory repository driver, seeded test tenants, and simulated AI/provider dispatching. No external PostgreSQL database or cloud credentials are required.
2. **Production Mode (`APP_ENV=production`)**: Connects to a live PostgreSQL cluster via Prisma ORM, validates cryptographically strong JWT and webhook secrets on startup, enforces tenant isolation at the database constraint level, and exposes Kubernetes/container-compatible `/live` and `/ready` probes.

```
+-------------------------------------------------------------------------+
|                        Production Architecture                          |
+-------------------------------------------------------------------------+
|  Client (Browser / React 19 SPA)                                        |
|      |                                                                  |
|      v HTTPS (CORS & Security Headers)                                  |
|  Node.js v24 Express 5 REST API Gateway (/api/v1)                       |
|      |-- requestIdMiddleware & Rate Limiter (300 req/min)               |
|      |-- requireAuthentication (HMAC-SHA256 JWT)                        |
|      |-- tenantScopeMiddleware (req.agencyId derived from token)        |
|      |-- Service & Controller Layer                                     |
|      |-- Hard Real-Mode Safety Gate (Blocks live API execution)         |
|      |                                                                  |
|      v                                                                  |
|  Prisma ORM & PostgreSQL Database Cluster (Multi-Tenant Isolation)       |
+-------------------------------------------------------------------------+
```

---

### 2. Environment Variables Configuration

| Variable | Required in Prod | Default (Dev/Demo) | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Node runtime environment (`production` or `development`) |
| `APP_ENV` | Yes | `demo` | Application operational mode (`production` or `demo`) |
| `PORT` | No | `5000` | HTTP port for the Express backend server |
| `DATABASE_URL` | **Yes (in Prod)** | `""` | PostgreSQL connection string (`postgresql://USER:PASSWORD@HOST:5432/DB?schema=public`) |
| `JWT_SECRET` | **Yes (in Prod)** | `demo-jwt-secret...` | High-entropy HMAC-SHA256 secret (minimum 32 characters in production) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiration duration |
| `WEBHOOK_SECRET` | **Yes (in Prod)** | `demo-webhook...` | Secret key used to verify incoming webhook HMAC-SHA256 signatures |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Explicit allowed frontend origins (comma-separated if multiple) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Primary frontend web client URL |

---

### 3. Database Provisioning & Migration Execution

#### A. Initial Migration Deployment
When provisioning a new PostgreSQL database instance in staging or production:

1. **Set `DATABASE_URL`** in the secure production environment:
   ```bash
   export DATABASE_URL="postgresql://antigravity_user:securepassword@db.production.internal:5432/antigravity_agency?schema=public"
   ```

2. **Deploy the Migration DDL**:
   ```bash
   npm run db:migrate:deploy
   ```
   *Alternative manual deployment using PostgreSQL CLI*:
   ```bash
   psql "$DATABASE_URL" -f server/prisma/migrations/0_init/migration.sql
   ```

3. **Verify Database Health**:
   ```bash
   curl -s http://localhost:5000/api/v1/health/database | jq .
   ```
   *Expected Response:*
   ```json
   {
     "success": true,
     "data": {
       "statusCode": "DATABASE_CONNECTED",
       "status": "PostgreSQL Connected",
       "connected": true,
       "configured": true,
       "migrationStatus": {
         "status": "MIGRATIONS_APPLIED",
         "migrationReady": true
       }
     }
   }
   ```

---

### 4. Health, Liveness & Readiness Probes

The backend provides operational endpoints for container orchestrators (Kubernetes, AWS ECS, Docker Swarm, Render):

- **Liveness Probe (`GET /api/v1/health/live`)**:
  - Validates that the Node.js process is active and event loop is responsive.
  - Returns `200 OK` with uptime in seconds.
- **Readiness Probe (`GET /api/v1/health/ready`)**:
  - In **Production**: Returns `200 OK` only if PostgreSQL is connected and migrations are synchronized. Returns `503 Service Unavailable` if database connection fails.
  - In **Demo Sandbox**: Returns `200 OK` indicating sandbox is operational.
- **General Health (`GET /api/v1/health`)**:
  - Returns full system status, database connection, environment, and uptime metrics.
- **Provider Readiness (`GET /api/v1/health/providers`)**:
  - Reports status for Meta WhatsApp, Google Ads, CRM, SEO, and Payment gateways.

---

### 5. Production Provider Safety Architecture

All external integrations maintain a **Hard Real-Mode Safety Gate**:
- **Meta WhatsApp Cloud API**: Sandbox driver loads in Demo mode; live requests strictly throw `403 EXECUTION_BLOCKED` until credentials and endpoints are validated.
- **Google & Meta Ads Engine**: Campaign adjustments are verified and tested in Sandbox mode.
- **Payment & Financial Gateway**: Invoices and balances are recorded defensively. Live financial capture is blocked in Demo mode.
- **AI Action Execution Boundary**: Real execution requires human-in-the-loop operator approval and throws `403 EXECUTION_BLOCKED` in sandbox environments.

---

### 6. Backup, Disaster Recovery & Secret Rotation

#### A. Database Backup Strategy
- **Automated Snapshots**: Schedule daily automated snapshots using standard PostgreSQL tools (`pg_dump`):
  ```bash
  pg_dump -Fc --no-acl --no-owner -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > backup_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Point-in-Time Recovery (PITR)**: Ensure WAL archiving is enabled on production database instances.

#### B. Secret Rotation Procedure
1. Generate new 256-bit cryptographically secure keys for `JWT_SECRET` and `WEBHOOK_SECRET`.
2. Update secrets in the production secret vault (AWS Secrets Manager, Doppler, Vault, or Render Secret Store).
3. Perform a zero-downtime rolling restart of the container service.
4. Verify `/api/v1/health/ready` returns `status: "ready"`.

---

### 7. Pre-Launch Checklist

- [x] Environment variables configured and validated (`DATABASE_URL`, `JWT_SECRET`, `WEBHOOK_SECRET`).
- [x] Database migration applied (`server/prisma/migrations/0_init/migration.sql`).
- [x] CORS origins set explicitly without wildcards (`CORS_ORIGIN`).
- [x] Multi-tenant isolation verified across all 9 subsystems (`403 AUTHORIZATION_ERROR` on cross-tenant access).
- [x] Hard Real-Mode Safety Gates verified active (`403 EXECUTION_BLOCKED`).
- [x] Rate limiting active (300 requests/min per IP).
- [x] Health and readiness probes responding (`/api/v1/health/live`, `/api/v1/health/ready`).
- [x] Production build generated cleanly with zero lint or import errors (`npm run build`).
