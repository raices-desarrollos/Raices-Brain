import Link from 'next/link';

const modules = [
  {
    href: '/administracion/pagos',
    label: 'Pagos',
    description: 'Ingresos y egresos, estados y vencimientos.',
  },
  {
    href: '/administracion/contactos',
    label: 'Contactos',
    description: 'Socios, inversores, arquitectos y proveedores.',
  },
  {
    href: '/facturas',
    label: 'Facturas',
    description: 'Cargar, revisar y marcar como pagadas. El archivo queda en Drive.',
  },
  {
    href: '/documentos',
    label: 'Documentos',
    description: 'Google Drive es el archivo. Vinculá archivos a Ceibo Vidal.',
  },
];

export default function AdministracionPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="mb-8">
        <p className="text-niebla text-xs tracking-[0.2em] uppercase mb-2">Operación</p>
        <h1 className="font-serif text-3xl font-light text-ink">Administración</h1>
        <p className="text-niebla text-sm mt-1.5">Pagos y contactos. Facturas y documentos tienen su propia sección.</p>
      </div>

      <div className="divide-y divide-suelo">
        {modules.map((m) => (
          <Link key={m.href} href={m.href} className="block py-5 group">
            <p className="text-ink group-hover:text-musgo">{m.label}</p>
            <p className="text-sm text-niebla mt-0.5">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
