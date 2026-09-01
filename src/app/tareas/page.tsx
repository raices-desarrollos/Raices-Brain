import { redirect } from 'next/navigation';

/** Tareas viven en ClickUp; esta ruta queda por si alguien tenía el bookmark. */
export default function TareasRedirect() {
  redirect('/');
}
