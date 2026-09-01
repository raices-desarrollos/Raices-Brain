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
        <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Configuración</p>
        <h1 className="text-2xl font-light text-gray-900">Admin</h1>
        <p className="text-xs text-gray-500 mt-3 max-w-lg border-l-2 border-gray-200 pl-3">
          Estado de la configuración del sistema. Muestra qué variables de entorno están activas,
          qué servicios externos están conectados y qué scripts están disponibles para correr
          manualmente.
        </p>
      </div>

      {/* Environment status */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 tracking-widest uppercase mb-3">
          Variables de entorno
        </h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {envVars.map((v) => {
            const ok = configured[v.key as keyof typeof configured];
            return (
              <div key={v.key} className="flex items-center gap-4 px-5 py-3 bg-gray-50">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-blue-600' : v.required ? 'bg-ceibo' : 'bg-niebla'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-900">{v.key}</p>
                  <p className="text-2xs text-gray-500">{v.description}</p>
                </div>
                <span
                  className={`text-2xs ${ok ? 'text-blue-600' : v.required ? 'text-red-600' : 'text-gray-500'}`}>
                  {ok ? 'Configurada' : v.required ? 'Faltante' : 'Opcional'}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-2xs text-niebla mt-2">
          Las conexiones se configuran en el servidor de despliegue. Esta pantalla es solo para quien administra la app.
        </p>
      </div>

      {/* Admin sections */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 tracking-widest uppercase mb-3">
          Secciones
        </h2>
        <div className="space-y-3">
          {sections.map((s) => (
            <div
              key={s.href}
              className="border border-gray-200 rounded-xl p-5 bg-gray-50 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </div>
              <span className="flex-shrink-0 text-2xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div>
        <h2 className="text-xs font-medium text-niebla tracking-widest uppercase mb-3">
          Mantenimiento
        </h2>
        <p className="text-sm text-niebla">
          Sembrar datos y actualizar el archivo se hacen desde la máquina de desarrollo, no desde esta pantalla.
        </p>
      </div>
    </div>
  );
}
