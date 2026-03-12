# Changelog

Todo cambio notable en este proyecto será documentado en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), 
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/).

## [0.1.0-alpha] - 2026-03-11

Versión inicial y arquitectura base en desarrollo.

### Añadido (Added)
- Inicialización de entorno de trabajo Monorepo (`concurrently`) con React 19 y Node 22 (Vite/TSX).
- **Core Frontend:** 
  - Organización bajo principios de Clean Architecture (`src/domain`, `src/data`, `src/presentation`, `src/services`).
  - Integración de TailwindCSS V4 y componentes vectoriales (`lucide-react`).
  - Modelado de biometría facial pre-lista (`@mediapipe/tasks-vision`).
- **Core Backend (Express 4.21 API):**
  - Módulos administrativos: Endpoint base para control de catálogo de centros médicos (`medical-centers`), especialidades (`specialties`), roles (`team-roles`), aseguradoras (`health-insurances`). 
  - Módulo de autoenrolamiento: Lógica para registrar y dar seguimiento a solicitudes (`enrollment-requests`, `enrollment-requests-status`).
  - Flujo de aceptación de términos (`terms.ts`).
  - Integración con Junta Central Electoral (`jce.ts`).
- **Seguridad:**
  - Controladores JWT (`jsonwebtoken`, `express-jwt`) para tokens de sesión.
  - Hashing bidireccional mediante `bcryptjs`.
  - Endpoint dedicado para flujo OTP (`api/otp/`).
  - Autenticación (`login.ts`, directorio `auth/`).
- **Infraestructura:**
  - Setup inicial de migraciones de `PostgreSQL` (`database/migrations`).
  - SDK de subida adaptado para `Vercel Blob`.
