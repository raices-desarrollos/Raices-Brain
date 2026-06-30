#!/usr/bin/env tsx
/**
 * get-google-token.ts
 *
 * Corre este script UNA SOLA VEZ para obtener el refresh token de Google.
 * El token se guarda en .env.local automáticamente.
 *
 * Uso:
 *   npx tsx scripts/get-google-token.ts
 */

import * as fs from 'fs';
import { google } from 'googleapis';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌  Faltan variables en .env.local:');
  console.error('    GOOGLE_CLIENT_ID=...');
  console.error('    GOOGLE_CLIENT_SECRET=...\n');
  console.error('Seguí el paso 1 de la Guía de conexión en el README.\n');
  process.exit(1);
}

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n─────────────────────────────────────────────────────────');
console.log('  Autorización de Google Drive');
console.log('─────────────────────────────────────────────────────────');
console.log('\n1. Abrí esta URL en tu navegador:\n');
console.log('  ', authUrl);
console.log('\n2. Autorizá la app con tu cuenta de Google.');
console.log('3. Vas a ser redirigido a localhost:3001 — esperá acá.\n');

// Levanta un servidor HTTP temporal para capturar el código de autorización
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url ?? '', true);
  if (parsedUrl.pathname !== '/oauth2callback') return;

  const code = parsedUrl.query.code as string;
  res.end('<h2>✅ Autorizado. Podés cerrar esta ventana y volver a la terminal.</h2>');
  server.close();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      console.error('\n❌  No se recibió refresh_token. Intentá revocar el acceso en:');
      console.error('    https://myaccount.google.com/permissions');
      console.error('    y corré el script de nuevo.\n');
      process.exit(1);
    }

    // Actualizar .env.local con el refresh token
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(
        /GOOGLE_REFRESH_TOKEN=.*/,
        `GOOGLE_REFRESH_TOKEN=${refreshToken}`,
      );
    } else {
      envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅  Token guardado en .env.local (GOOGLE_REFRESH_TOKEN)');
    console.log('\nPróximo paso: configurá GOOGLE_DRIVE_FOLDER_ID en .env.local');
    console.log('y corré: npx tsx scripts/sync-drive.ts\n');
  } catch (err) {
    console.error('❌  Error al obtener el token:', err);
    process.exit(1);
  }
});

server.listen(3001);
