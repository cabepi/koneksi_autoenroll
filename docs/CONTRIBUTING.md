# Guía de Contribución (CONTRIBUTING)

¡Gracias por tu interés en contribuir a **Koneksi Autoenrolamiento**! Para mantener un código escalable y organizado, todos los desarrolladores deben seguir estas pautas.

## Estilo de Código (Linting y Type Checking)

- **TypeScript Strict Mode:** El proyecto (`tsconfig.app.json` / `tsconfig.node.json`) impone el modo estricto. Todas las variables, retornos y parámetros deben estar tipados de manera explícita (evitar `any` bajo cualquier circunstancia).
- **React 19 Hooks & Paradigms:** Dado que estamos usando la última versión, se espera que el código explote de manera idiomática el manejo de concurrencia y los nuevos *hooks*.
- **TailwindCSS V4:** Las clases de estilos deben gestionarse estrictamente con utilidades propias de Tailwind. Abstenerse de inyectar CSS global o *inline* salvo necesidades matemáticas ineludibles.

## Flujo de Ramas (Git Flow)

Este repositorio mantiene un esquema estricto de bifurcación:

1. `main` (o `master`): Rama de producción. El código aquí es completamente estable.
2. `develop` (o equivalente a staging): La rama de integración donde convergen las nuevas *features*.
3. `feature/nombre-de-la-funcionalidad`: Ramas temporales creadas *desde* `develop`.
4. `hotfix/nombre-del-error`: Ramas urgentes extraídas *desde* `main` para resolver bugs críticos.

## Mensajes de Commit (Conventional Commits)

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/) para auto-generar nuestro CHANGELOG y mantener orden en el historial:

- `feat:` Una nueva característica o módulo (ej. `feat: agregar validador mediapipe para enrolamiento`).
- `fix:` Resolución de un error (ej. `fix: corregir proxy de conexión a JCE`).
- `docs:` Cambios exclusivos sobre documentación (`README`, `ARCHITECTURE`, etc).
- `style:` Cambios que no afectan el significado del código (espaciados, formato, comas faltantes).
- `refactor:` Un cambio de código que no corrige un error ni añade una característica.
- `chore:` Actualización de dependencias o configuraciones del compilador (`Vite`, `package.json`).

**Ejemplo:**
```bash
git commit -m "feat(auth): integrar validación otp y tokens jwt"
```

## Proceso de Pull Request (PR)

1. Sube tu rama: `git push origin feature/mi-nueva-caracteristica`
2. Abre un *Pull Request* hacia la rama `develop`.
3. Todo PR requiere al menos 1 aprobación (Code Review) para ser fusionado.
4. Asegúrate de compilar (`npm run build`) para validar que TypeScript y Vite resuelvan la construcción sin errores.
