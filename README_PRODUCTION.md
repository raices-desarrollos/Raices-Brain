# Raíces Brain

Plataforma interna de Raíces Desarrollos para gestión de factibilidades, contactos, pagos y documentos.

---

## Índice

1. [Correrlo localmente (desarrollo)](#desarrollo-local)
2. [Llevarlo a producción](#producción)
3. [Variables de entorno](#variables-de-entorno)
4. [Crear los dos usuarios](#crear-los-dos-usuarios)
5. [Despliegue y actualizaciones](#despliegue-y-actualizaciones)
6. [Backups](#backups)

---

## Desarrollo local

### Opción A — Con Supabase como base de datos (recomendado)

No necesitás instalar PostgreSQL local. Usás la misma base de datos que en producción, o creás un proyecto separado para desarrollo.

#### 1a. Crear cuenta y proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y hacer clic en **Start your project**
2. Crear cuenta con GitHub o email
3. Una vez adentro: clic en **New project**
4. Completar:
   - **Organization**: la que se crea sola con tu cuenta (o crear una nueva para Raíces)
   - **Name**: `raices-brain` (o `raices-brain-dev` para desarrollo separado)
   - **Database Password**: elegir una contraseña segura — **guardala**, la necesitás enseguida
   - **Region**: elegir `South America (São Paulo)` para menor latencia
5. Clic en **Create new project** — tarda ~2 minutos en crearse

#### 1b. Obtener la DATABASE_URL

1. Una vez creado el proyecto, ir a **Settings** (ícono de engranaje, abajo a la izquierda)
2. Ir a **Database**
3. Bajar hasta la sección **Connection string**
4. Seleccionar la pestaña **URI**
5. Copiar el string — se ve así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Reemplazar `[YOUR-PASSWORD]` con la contraseña que elegiste en el paso anterior

Ese string es tu `DATABASE_URL`.

#### 1c. Configurar variables de entorno

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Editar `.env.local`:

   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[proyecto].supabase.co:5432/postgres
   NEXTAUTH_SECRET=[generalo con: openssl rand -base64 32]
   NEXTAUTH_URL=http://localhost:3000
   OPENAI_API_KEY=sk-...
   STORAGE_PROVIDER=local
   ```

3. **Instalar dependencias**

   ```bash
   npm install
   ```

4. **Crear las tablas**

   ```bash
   npm run db:migrate
   ```

5. **Crear los usuarios**

   ```bash
   DATABASE_URL="..." \
   USER1_EMAIL="socio1@raicesdesarrollos.com" \
   USER1_PASSWORD="unaContraseñaSegura" \
   USER2_EMAIL="socio2@raicesdesarrollos.com" \
   USER2_PASSWORD="otraContraseñaSegura" \
   npx tsx scripts/create-users.ts
   ```

6. **Correr la app**

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000) → redirige a `/login`.

---

### Opción B — Con PostgreSQL instalado localmente

**Instalar PostgreSQL en macOS:**

**Opción más fácil — Postgres.app:**

1. Descargar desde [postgresapp.com](https://postgresapp.com) e instalar
2. Abrirlo y hacer clic en "Initialize"
3. Agregar los binarios al PATH:
   ```bash
   echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

**Opción con Homebrew:**

```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Crear la base de datos y correr la app:**

```bash
createdb raices_brain

cp .env.example .env.local
# Editar .env.local:
# DATABASE_URL=postgresql://localhost/raices_brain
# NEXTAUTH_SECRET=[openssl rand -base64 32]
# NEXTAUTH_URL=http://localhost:3000

npm install
npm run db:migrate

# Crear usuarios (ver sección más abajo)

npm run dev
```

---

### Comandos útiles de desarrollo

```bash
npm run dev          # Servidor en http://localhost:3000
npm test             # Correr los tests (27 tests de factibilidad + más)
npm run db:migrate   # Aplicar cambios del schema a la base de datos
npm run db:studio    # Explorador visual de la DB en http://localhost:4983
npm run build        # Build de producción (verificar antes de deployar)
```

---

## Producción

### Arquitectura

Ambos socios se conectan desde cualquier lugar vía navegador con usuario y contraseña. Toda la información queda centralizada en la misma base de datos compartida.

| Componente         | Servicio                                | Costo aprox./mes |
| ------------------ | --------------------------------------- | ---------------- |
| Hosting (Next.js)  | **Vercel**                              | USD 0–20         |
| Base de datos      | **Supabase** (PostgreSQL)               | USD 0–25         |
| Storage documentos | Carpeta en servidor o Supabase Storage  | USD 0–5          |
| Dominio            | Cualquier registrador (Namecheap, etc.) | USD 12/año       |
| HTTPS              | Automático en Vercel                    | USD 0            |
| **Total estimado** |                                         | **USD 0–50/mes** |

---

### Paso 1 — Crear los servicios

**Supabase (base de datos):**

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Name: `raices-brain`, Region: `South America (São Paulo)`
3. Elegir una **Database Password** segura y guardarla
4. Esperar ~2 minutos a que se cree
5. Ir a **Settings → Database → Connection string → URI**
6. Copiar el string y reemplazar `[YOUR-PASSWORD]` con la contraseña elegida → esa es tu `DATABASE_URL`

**Vercel (hosting):**

1. Ir a [vercel.com](https://vercel.com) → crear cuenta con GitHub
2. Si el repositorio está en GitHub: Vercel → **New Project** → importar el repo → listo
3. Si no está en GitHub todavía: subir el código primero (ver Paso 2)

**Dominio (opcional):**

- Comprar en [namecheap.com](https://namecheap.com) o cualquier registrador
- Ej: `brain.raicesdesarrollos.com` o `raicesbrain.com`

---

### Paso 2 — Conectar el repositorio a Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

O desde la web: Vercel → New Project → importar desde GitHub.

---

### Paso 3 — Configurar variables de entorno en Vercel

En Vercel → Settings → Environment Variables, cargar:

```
DATABASE_URL        → Connection string de Supabase (Settings → Database → URI)
NEXTAUTH_SECRET     → Resultado de: openssl rand -base64 32
NEXTAUTH_URL        → https://brain.raicesdesarrollos.com  (o la URL de Vercel)
OPENAI_API_KEY      → Tu clave de OpenAI
STORAGE_PROVIDER    → local  (ver nota abajo)
NODE_ENV            → production
NEXT_PUBLIC_APP_URL → https://brain.raicesdesarrollos.com
```

> **Nota sobre documentos en Vercel**: Vercel es serverless — el filesystem no persiste entre requests. Si vas a usar el módulo de Documentos, necesitás `STORAGE_PROVIDER=supabase` o deployar en Railway/Render donde el disco sí persiste. Para empezar podés ignorar el módulo de documentos y activarlo después.

---

### Paso 4 — Crear las tablas en producción

```bash
DATABASE_URL="postgresql://postgres:[pass]@db.[proyecto].supabase.co:5432/postgres" \
npm run db:migrate
```

---

### Paso 5 — Crear los dos usuarios

```bash
DATABASE_URL="postgresql://..." \
USER1_EMAIL="socio1@raicesdesarrollos.com" \
USER1_PASSWORD="contraseñaSegura1" \
USER2_EMAIL="socio2@raicesdesarrollos.com" \
USER2_PASSWORD="contraseñaSegura2" \
npx tsx scripts/create-users.ts
```

Las contraseñas quedan hasheadas. **No se guardan en texto plano en ningún lado.**

---

### Paso 6 — Dominio y HTTPS

En Vercel → Settings → Domains → agregar `brain.raicesdesarrollos.com`.

En tu registrador de dominio, agregar un registro DNS:

```
Tipo:  CNAME
Nombre: brain
Valor: cname.vercel-dns.com
```

Vercel activa HTTPS automáticamente (certificado Let's Encrypt gratuito).

---

### Paso 7 — Verificación final

Desde el navegador:

- `https://brain.raicesdesarrollos.com` → debe redirigir a `/login`
- Probar login con cada uno de los dos usuarios
- Crear una factibilidad de prueba y verificar que persiste al recargar

---

## Variables de entorno

| Variable            | Obligatoria  | Descripción                                                                |
| ------------------- | ------------ | -------------------------------------------------------------------------- |
| `DATABASE_URL`      | ✓            | PostgreSQL connection string                                               |
| `NEXTAUTH_SECRET`   | ✓            | Secreto para firmar sesiones — generar con `openssl rand -base64 32`       |
| `NEXTAUTH_URL`      | ✓            | URL base de la app (`http://localhost:3000` en dev, `https://...` en prod) |
| `OPENAI_API_KEY`    | ✓ para Brain | Clave de OpenAI para el chat con IA                                        |
| `STORAGE_PROVIDER`  | —            | `local` (default)                                                          |
| `STORAGE_LOCAL_DIR` | —            | Carpeta de uploads (default: `./uploads`)                                  |
| `NODE_ENV`          | —            | `development` o `production`                                               |

Ver `.env.example` para la lista completa.

---

## Crear los dos usuarios

```bash
DATABASE_URL="postgresql://..." \
USER1_EMAIL="email1@..." \
USER1_PASSWORD="contraseña1" \
USER2_EMAIL="email2@..." \
USER2_PASSWORD="contraseña2" \
npx tsx scripts/create-users.ts
```

Para cambiar contraseña: volver a correr el script con el mismo email y nueva contraseña — el script usa `onConflictDoNothing`, así que para actualizar hay que eliminar el usuario primero desde `npm run db:studio` y volver a crearlo.

---

## Despliegue y actualizaciones

Una vez conectado el repo a Vercel desde GitHub, cada push a `main` dispara un deploy automático.

```bash
git add -A
git commit -m "feat: descripción del cambio"
git push origin main
# Vercel deploya en ~1 minuto
```

Si el cambio incluye modificaciones al schema de la base de datos, aplicar la migración **antes** de pushear el código:

```bash
DATABASE_URL="[url de producción]" npm run db:migrate
git push origin main
```

---

## Backups

### Backup automático

Supabase hace backups diarios automáticamente (plan Free: 7 días de retención; Plan Pro: 30 días).

### Backup manual

```bash
pg_dump "postgresql://postgres:[pass]@db.[proyecto].supabase.co:5432/postgres" \
  > backup-$(date +%Y%m%d).sql

gzip backup-$(date +%Y%m%d).sql
```

### Restauración

```bash
gunzip < backup-20260101.sql.gz | \
  psql "postgresql://postgres:[pass]@db.[proyecto].supabase.co:5432/postgres"
```

### Documentos

Si usás storage local, respaldar periódicamente la carpeta `uploads/` del servidor.
