# Requerimientos del Sistema (Koneksi Autoenrolamiento)

Este documento enumera los requerimientos funcionales y no funcionales que la solución de software (Arquitectura Limpia + Node + React) está cubriendo actualmente.

## Requerimientos Funcionales (Casos de Uso)

1. **Gestión de Autenticación y Autorización**
   - El sistema debe permitir el inicio de sesión (`/api/login.ts`).
   - El sistema debe validar la identidad mediante un token JWT administrado entre el backend y el cliente (`express-jwt`).
   - Implementación de un flujo de OTP (One Time Password) (`/api/otp/`).

2. **Autoenrolamiento de Especialistas Médicos**
   - El sistema debe permitir registrar y gestionar solicitudes de enrolamiento (`/api/enrollment-requests.ts`).
   - Se debe llevar un control de estado de las solicitudes (`/api/enrollment-requests-status.ts`).
   - El proceso de enrolamiento requiere cargar validaciones contra entidades oficiales, por ejemplo, validación contra la Junta Central Electoral (`/api/jce.ts`).

3. **Módulo de Catálogos (Metadata Relacional)**
   - Listado y gestión de Administradoras de Riesgos de Salud (Seguros): (`/api/health-insurances.ts`).
   - Listado y gestión de Centros Médicos: (`/api/medical-centers.ts`).
   - Listado y gestión de Especialidades: (`/api/specialties.ts`).
   - Listado y gestión de Roles de Equipo Médico: (`/api/team-roles.ts`).

4. **Biometría y Visión Computacional**
   - El sistema debe implementar funcionalidades para procesar imágenes biológicas/faciales utilizando los modelos de MediaPipe (`@mediapipe/tasks-vision`) para validar al especialista en tiempo real desde el frontend.

5. **Aceptación de Términos**
   - El registro requiere la aceptación explícita de términos y condiciones (`/api/terms.ts`).

## Requerimientos No Funcionales

1. **Rendimiento**
   - **Tiempo de carga inicial:** Minimizado a través del proceso de *build* optimizado por Vite.
   - **Motor Frontend:** Se exige el uso de React v19 para aprovechar las mejoras concurrentes en UI y optimización del DOM.
   
2. **Escalabilidad y Mantenibilidad**
   - **Clean Architecture:** Separación estricta de la UI (`presentation`), casos de uso (`services`/`domain`) y el almacenamiento o llamadas externas (`data`).
   - **Monorepo gestionado (TSX / Vite):** Debe soportar el inicio simultáneo usando `concurrently`.

3. **Seguridad**
   - **Protección de rutas de API:** El backend se escuda a través del `http-proxy-middleware`.
   - **Hashing de Credenciales:** Todas las claves internas deben encriptarse usando `bcryptjs`.
   - **Resiliencia de Conexión (CORS):** Control granular de dominios cruzados mediante el paquete `cors`.

4. **Persistencia y Almacenamiento**
   - La base de datos relacional debe gestionarse a través de migraciones limpias sobre el motor de `PostgreSQL` y su driver nativo (`pg`).
   - El manejo de binarios y archivos (fotos/documentos provistos durante el autoenrolamiento) será escalado a través del servicio de *Vercel Blob*.
