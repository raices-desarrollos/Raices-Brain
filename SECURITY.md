# Seguridad — Raíces Brain

## Modelo de amenaza

Aplicación interna para dos socios. Sin acceso público a datos. El objetivo es proteger información comercial y financiera confidencial.

## Controles implementados

### Autenticación

- NextAuth v4 con sesiones JWT (8 horas de duración)
- Contraseñas hasheadas con bcrypt (costo 12)
- Sin usuarios hardcodeados ni contraseñas en el código
- Redirección automática a `/login` para rutas no autenticadas (middleware de Next.js)

### Autorización

- Todos los endpoints de API verifican sesión en el backend antes de responder
- Responden `401 Unauthorized` sin detalles si la sesión no es válida
- La autorización no depende únicamente del frontend

### Base de datos

- Conexión vía variable de entorno `DATABASE_URL` (nunca hardcodeada)
- Consultas parametrizadas a través de Drizzle ORM (protección contra SQL injection)
- Base de datos no expuesta públicamente (Supabase con RLS o PostgreSQL en VPC privada)

### Documentos

- Los archivos nunca se sirven desde URLs públicas
- El acceso pasa siempre por `/api/documents/[id]/download` que verifica sesión
- Tipos de archivo permitidos: PDF, imágenes, Word, Excel, texto plano
- Límite de tamaño: 25 MB por archivo
- Los archivos se almacenan con nombres UUID (no predecibles)
- La carpeta `uploads/` está en `.gitignore`

### Secretos y configuración

- Todos los secretos en variables de entorno
- `.env.local` nunca se commitea (está en `.gitignore`)
- `.env.example` no contiene valores reales
- Separación entre entornos de desarrollo y producción

### Logs y auditoría

- Registro de: login, creación, modificación, eliminación, subida y descarga de documentos
- Los logs **no** contienen contraseñas ni tokens
- Tabla `audit_log` en la misma DB con usuario, acción, entidad y timestamp

### HTTPS

- Obligatorio en producción (Vercel provee TLS automáticamente)
- `NEXTAUTH_URL` debe usar `https://` en producción

## Prácticas de desarrollo seguro

- Las dependencias se auditan con `npm audit` antes de cada release
- No se agregan dependencias innecesarias
- Los secrets no se loguean ni se exponen en respuestas de error

## Lo que NO implementamos (intencionalmente para esta versión)

- Autenticación multifactor (MFA) — recomendado agregar en v2
- Rate limiting en login (recomendado agregar en v2 usando `next-rate-limit`)
- Headers de seguridad HTTP avanzados (CSP, HSTS, etc.) — agregar en `next.config.js`
- Rotación automática de secretos
- Sistema SIEM o alertas de seguridad

## Próximos pasos de seguridad recomendados

1. Agregar `next-rate-limit` o similar para limitar intentos de login (brute force)
2. Agregar headers HTTP de seguridad en `next.config.js`:
   ```js
   headers: [
     {
       source: '/(.*)',
       headers: [
         { key: 'X-Frame-Options', value: 'DENY' },
         { key: 'X-Content-Type-Options', value: 'nosniff' },
         { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
       ],
     },
   ];
   ```
3. Activar MFA en Supabase para el acceso a la consola de base de datos
4. Revisar permisos de la Service Role Key de Supabase (usar roles mínimos)

## Reporte de vulnerabilidades

Si encontrás una vulnerabilidad, comunicala directamente a los socios por canal privado.
