# Guía de trabajo para Claude

## Proyecto

Trabajás en Estudio Guzman, una aplicación React/Vite para la gestión interna de un estudio jurídico. El producto administra expedientes, contactos, actuaciones, cuadernos, tareas, notas y actividad del equipo.

La aplicación hoy funciona como MVP local. Sus datos se inicializan desde `src/data/mockData.ts`, se gestionan en `src/store/AppContext.tsx` y se guardan en el navegador. No asumas que hay backend, autenticación, archivos reales ni base de datos.

## Prioridades

1. Preservar la claridad del dominio jurídico y no simplificar relaciones que el producto necesitará: un expediente puede tener múltiples partes y representantes.
2. Priorizar seguridad y privacidad: no exponer ni inventar datos sensibles.
3. Mantener la UI consistente, accesible y responsive.
4. Hacer cambios pequeños, tipados y verificables.

## Reglas de implementación

- Revisá `src/types/index.ts` antes de alterar estructuras de datos.
- Usá React, TypeScript, Tailwind y los componentes existentes de shadcn/ui en `src/components/ui`.
- No instales una biblioteca de componentes alternativa. shadcn/ui entrega archivos fuente al repositorio; no es un paquete de UI que se importe desde una dependencia única.
- Para nuevos componentes de UI, reutilizá primero los componentes existentes. Si falta uno, agregalo con el CLI de shadcn de manera no interactiva y revisá los cambios que incorpora.
- Usá `src/lib/utils.ts` y su helper `cn` para combinar clases.
- Conservá los textos de la interfaz en español rioplatense neutral y los estados ya establecidos: Activo, Pendiente, Cerrado, Archivado; Pendiente, En progreso, Completada.
- Evitá `any`, mutaciones directas de estado y llamadas a `localStorage` fuera de la capa de estado salvo una justificación clara.
- Si modificás una entidad, actualizá sus tipos, mocks, operaciones del contexto y pantallas consumidoras.
- No modifiques `package-lock.json` solo para cambios de documentación o UI que no cambien dependencias.

## Verificación

Ejecutá, cuando corresponda:

```bash
npm run lint
npm run build
```

Al cambiar pantallas, verificá además estados vacíos, formularios, navegación, responsividad básica, etiquetas accesibles y no regresión en los flujos relacionados.

## Documentación

- `docs/README.md` describe el producto y sus límites actuales.
- `docs/FEATURES.md` es la fuente de alcance funcional.
- `docs/PROGRESS.md` registra avances, decisiones y trabajo pendiente. Actualizalo con cada cambio relevante.
- El modelo de datos está documentado en `../Modelo de datos Estudio Guzman.docx`.

Si una solicitud choca con estas pautas o requiere una decisión de negocio no definida, explicá el impacto y pedí la definición mínima necesaria antes de inventar una regla.
