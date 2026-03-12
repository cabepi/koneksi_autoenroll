# Política de Seguridad del Sistema (Koneksi Autoenrolamiento)

Koneksi prioriza el resguardo de la información de los especialistas y usuarios del portal de enrolamiento. Debido a la naturaleza de los datos sensibles manejados (Biometría, validaciones con JCE, credenciales médicas), establecemos los siguientes protocolos.

## Versiones Soportadas

Actualmente, solo la rama principal que derive en la construcción estable mantendrá monitorización. Al tratarse de un sistema Alpha, las versiones vulnerables no tendrán política de retrocompatibilidad (Backport).

| Versión | Estado de Soporte | Notas |
|:-------:|:---------|:------|
| >= 0.1.0-alpha| ✅ Activo | En desarrollo activo bajo Node.js 20+ y paquetes actualizados |
| < 0.1.0 | ❌ Sin Soporte | Pruebas de concepto obsoletas |

## Almacenamiento e Integraciones de Alto Riesgo

1. **Vercel Blob:** La carga de imágenes e identificaciones se redirige a este *storage* externo para no comprometer el servidor node. No alojar documentos físicos en el EFS o disco de la instancia.
2. **PostgreSQL / Bcrypt:** Toda clave en la BD (`database/`) viaja bajo cifrado. En ningún evento un Administrador puede exportar *passwords* en texto claro.
3. **Punto final de la JCE (`jce.ts`):** Las peticiones a la Junta Central Electoral requieren proxy seguro (configurado con `http-proxy-middleware`) para no exponer credenciales gubernamentales en la API pública.

## Reportar una Vulnerabilidad

Si observas una fuga de tokens (`jsonwebtoken`), debilidades en los modelos de `@mediapipe` o exposición de datos PII:

1. **No abras un Issue Público en GitHub.** Por favor, no expongas a los usuarios o atacantes al fallo documentado.
2. Manda un correo directamente al Ingeniero / DevSecOps a cargo del despliegue indicando:
   - Resumen y pasos para reproducir (PoC).
   - Enlace o fragmento de los controladores implicados en `api/`.
3. Responderemos confirmando la recepción en un plazo máximo de 48 horas, aplicando la corrección en un `hotfix` directo.
