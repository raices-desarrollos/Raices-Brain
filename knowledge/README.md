# Knowledge

Conocimiento de Raíces. **Qué va a Git y qué no:**

| Ubicación | Se versiona | Qué es |
| --------- | ----------- | ------ |
| `company/`, `projects/`, `terrains/`, `providers/` | Sí | Fuente canónica: briefs, decisiones, copy, criterios (sobre todo `.md`). Assets comerciales curados (carpeta de venta, renders que usa el HTML). |
| `sync-drive/` | No | Espejo local de Google Drive. Se regenera con `npm run sync:drive`. |

No copiar a Git escrituras, poderes, planillas crudas ni dumps de Drive. Eso vive en Drive. Si un dato tiene que ser “verdad del Brain”, extraelo a un `.md` en `projects/…`.
