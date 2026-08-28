import Link from 'next/link';

const modules = [
  {
    href: '/administracion/contactos',
    label: 'Contactos',
    description: 'Socios, inversores, arquitectos, contadores y demás contactos del estudio.',
    icon: '👤',
  },
  {
    href: '/administracion/pagos',
    label: 'Pagos',
    description: 'Registro de ingresos y egresos, estados y vencimientos.',
    icon: '💳',
  },
  {
    href: '/administracion/documentos',
    label: 'Documentos',
    description: 'Contratos, escrituras, planos, presupuestos y comprobantes.',
    icon: '📎',
  },
];

export default function AdministracionPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Administración</h1>
        <p className="text-gray-500 text-sm mt-1">Gestión operativa del estudio</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:border-gray-300 transition group">
            <span className="text-2xl">{m.icon}</span>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {m.label}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{m.description}</div>
            </div>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-gray-500 ml-auto mt-1 group-hover:text-amber-600 transition">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
