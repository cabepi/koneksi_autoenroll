# Koneksi Autoenrolamiento

[![Estado](https://img.shields.io/badge/Estado-En_Construcci%C3%B3n-orange.svg)]()

Portal principal del sistema de autoenrolamiento y gestión de especialistas para Koneksi. Este proyecto integra un frontend moderno en React y un backend robusto en Node.js mediante una Arquitectura Limpia (Clean Architecture).

## Estado de Construcción

Actualmente el proyecto se encuentra en **etapa de desarrollo activo** (versión `0.1.0-alpha`). La estructura base de directorios, configuración de herramientas de frontend (Vite, TailwindCSS V4) y definición de las principales rutas del API (Express) ya ha sido implementada.

## Requisitos Previos

- Node.js (se recomienda la versión 20 o superior).
- NPM, Yarn o pnpm.
- PostgreSQL (para la base de datos local).

## Guía Rápida de Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`.
   - Ajusta los valores de conexión a la base de datos PostgreSQL, JWT secret, etc.

## Comandos del Entorno de Desarrollo

El proyecto utiliza `concurrently` para ejecutar de manera simultánea el frontend (puerto por defecto de Vite) y el backend (servidor Express).

- **Iniciar entorno de desarrollo (Frontend + Backend):**
  ```bash
  npm run dev
  ```
- **Compilar para producción:**
  ```bash
  npm run build
  ```
- **Previsualizar la construcción de producción:**
  ```bash
  npm run preview
  ```
