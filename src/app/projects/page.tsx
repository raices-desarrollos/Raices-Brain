import { redirect } from 'next/navigation';

/** Por ahora hay un solo desarrollo: la lista de proyectos no aporta nada. */
export default function ProjectsPage() {
  redirect('/projects/ceibo-vidal');
}
