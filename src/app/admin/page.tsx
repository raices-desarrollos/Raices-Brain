const sections = [
  {
    title: 'Fuentes de conocimiento',
    href: '/admin/sources',
    description:
      'Gestioná las fuentes que alimentan el knowledge base: GitHub, Google Drive y uploads manuales.',
    status: 'pendiente',
  },
  {
    title: 'Documentos indexados',
    href: '/admin/documents',
    description: 'Revisá los documentos vectorizados, sus metadatos y estado de indexación.',
    status: 'pendiente',
  },
  {
    title: 'Agentes',
    href: '/admin/agents',
    description:
      'Configurá los agentes: system prompts, permisos y fuentes habilitadas por agente.',
    status: 'pendiente',
  },
];

const envVars = [
  { key: 'OPENAI_API_KEY', required: true, description: 'Necesaria para el chat y embeddings.' },
  { key: 'DATABASE_URL', required: true, description: 'PostgreSQL para documentos y decisiones.' },
  { key: 'NEXTAUTH_SECRET', required: true, description: 'Autenticación de la app.' },
  {
    key: 'PINECONE_API_KEY',
    required: false,
    description: 'Solo si usás Pinecone como vector DB.',
  },
  { key: 'GITHUB_TOKEN', required: false, description: 'Sincronización desde GitHub.' },
  { key: 'GOOGLE_CLIENT_ID', required: false, description: 'Sincronización desde Google Drive.' },
];

export default function AdminPage() {
  const configured = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    PINECONE_API_KEY: !!process.env.PINECONE_API_KEY,
    GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-niebla text-xs tracking-widest uppercase mb-1">Configuración</p>
        <h1 className="text-2xl font-light text-ink">Admin</h1>
        <p className="text-xs text-niebla mt-3 max-w-lg border-l-2 border-suelo pl-3">
          Estado de la configuración del sistema. Muestra qué variables de entorno están activas,
          qué servicios externos están conectados y qué scripts están disponibles para correr
          manualmente.
        </p>
      </div>

      {/* Environment status */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-niebla tracking-widest uppercase mb-3">
          Variables de entorno
        </h2>
        <div className="border border-suelo rounded-xl overflow-hidden divide-y divide-suelo">
          {envVars.map((v) => {
            const ok = configured[v.key as keyof typeof configured];
            return (
              <div key={v.key} className="flex items-center gap-4 px-5 py-3 bg-lino">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-liquen' : v.required ? 'bg-ceibo' : 'bg-niebla'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-ink">{v.key}</p>
                  <p className="text-2xs text-niebla">{v.description}</p>
                </div>
                <span
                  className={`text-2xs ${ok ? 'text-musgo' : v.required ? 'text-ceibo' : 'text-niebla'}`}>
                  {ok ? 'Configurada' : v.required ? 'Faltante' : 'Opcional'}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-2xs text-niebla mt-2">
          Editá <code className="bg-suelo px-1 rounded">.env.local</code> y reiniciá el servidor
          para aplicar cambios.
        </p>
      </div>

      {/* Admin sections */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-niebla tracking-widest uppercase mb-3">
          Secciones
        </h2>
        <div className="space-y-3">
          {sections.map((s) => (
            <div
              key={s.href}
              className="border border-suelo rounded-xl p-5 bg-lino flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm text-ink">{s.title}</p>
                <p className="text-xs text-niebla mt-0.5">{s.description}</p>
              </div>
              <span className="flex-shrink-0 text-2xs text-niebla border border-suelo rounded-full px-2.5 py-1">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div>
        <h2 className="text-xs font-medium text-niebla tracking-widest uppercase mb-3">
          Scripts disponibles
        </h2>
        <div className="border border-suelo rounded-xl overflow-hidden divide-y divide-suelo">
          {[
            {
              cmd: 'npx tsx scripts/seed-db.ts',
              description: 'Carga datos base en la base de datos',
            },
            {
              cmd: 'npx tsx scripts/check-knowledge-health.ts',
              description: 'Verifica la salud del knowledge base',
            },
            {
              cmd: 'npx tsx scripts/sync-github.ts',
              description: 'Sincroniza documentos desde GitHub',
            },
            {
              cmd: 'npx tsx scripts/sync-drive.ts',
              description: 'Sincroniza documentos desde Google Drive',
            },
          ].map((s) => (
            <div key={s.cmd} className="px-5 py-3 bg-lino">
              <code className="text-xs text-ink font-mono">{s.cmd}</code>
              <p className="text-2xs text-niebla mt-0.5">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
