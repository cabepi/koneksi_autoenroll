# Tech Stack Institucional

El presente documento detalla el conjunto de tecnologías, frameworks y herramientas que componen el proyecto **Koneksi Autoenrolamiento**, según las dependencias actuales (`package.json`).

## Frontend

| Tecnología | Rol / Descripción | Versión |
|------------|-------------------|---------|
| **React** | Biblioteca principal para construir la interfaz de usuario. | `^19.0.0` |
| **Vite** | Empaquetador y servidor de desarrollo ultrarrápido. | `^6.1.0` |
| **React Router DOM** | Enrutamiento declarativo para React. | `^7.2.0` |
| **TailwindCSS** | Framework CSS de utilidades. | `^4.0.7` |
| **Lucide React** | Biblioteca de iconos vectoriales consistentes. | `^0.475.0` |
| **MediaPipe Vision** | Herramienta de IA integrada (`@mediapipe/tasks-vision`), probablemente para reconocimiento biométrico o validación de documentos. | `^0.10.32` |

## Backend

| Tecnología | Rol / Descripción | Versión |
|------------|-------------------|---------|
| **Node.js / Express** | Entorno de ejecución y framework web para crear la API REST. | `^4.21.2` |
| **PostgreSQL (`pg`)** | Driver nativo para la base de datos relacional. | `^8.13.3` |
| **BcryptJS** | Hash seguro de contraseñas. | `^2.4.3` |
| **JSON Web Token** | Sistema para autenticación basada en tokens (`jsonwebtoken`, `express-jwt`).| `^9.0.3` / `^8.5.1` |
| **Vercel Blob** | SDK para el almacenamiento de archivos (imágenes/documentos) en la nube. | `^2.3.0` |
| **HTTP Proxy Middleware**| Redirección y proxy para manejo de peticiones. | `^3.0.3` |

## Herramientas de Desarrollo y DevOps

| Herramienta | Descripción | Versión |
|-------------|-------------|---------|
| **TypeScript** | Superset de JavaScript de tipado estricto. | `^5.7.3` |
| **TSX** | Ejecución de TypeScript de forma nativa en entornos de desarrollo (Node). | `^4.19.2` |
| **Concurrently** | Utilidad para ejecutar el servidor y el cliente simultáneamente. | `^9.1.2` |
| **CI/CD** | Implementación y despliegue pendiente de definición. (Probablemente Vercel basado en dependencias relativas). | TBD |
