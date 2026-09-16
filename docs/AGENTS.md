# Instrucciones para agentes

## Contexto

Estudio Guzman es un MVP de gestión jurídica construido como una SPA React/Vite. En la versión actual no hay backend: `AppContext` conserva colecciones mockeadas y las persiste en `localStorage` bajo la clave `estudio_guzman_data_v1`.

## Estructura relevante

```text
src/
  components/layout/   # Layout, barra lateral y encabezado
  components/ui/       # Componentes locales de shadcn/ui
  data/mockData.ts     # Datos iniciales de demostración
  pages/               # Rutas y pantallas de producto
  store/AppContext.tsx # Estado local y operaciones CRUD simuladas
  types/index.ts       # Tipos de dominio
```

## Reglas obligatorias

1. Antes de cambiar lógica, leer los tipos en `src/types/index.ts`, el estado en `src/store/AppContext.tsx` y la pantalla afectada.
2. Mantener TypeScript estricto. No usar `any` salvo que exista una razón excepcional y documentada.
3. Usar los componentes locales de shadcn/ui en `src/components/ui`. No crear botones, diálogos, selects, tablas o inputs desde cero si ya existe un componente equivalente.
4. Para agregar un componente shadcn/ui, preferir el CLI no interactivo: `npx shadcn@latest add <componente>`. Revisar el diff y no sobrescribir componentes locales sin necesidad.
5. Mantener los estilos con Tailwind CSS y utilizar `cn` desde `src/lib/utils.ts` al componer clases condicionales.
6. No dejar `hasFile` ni datos mockeados como sustituto de una funcionalidad de producción sin marcarlo explícitamente como parcial.
7. No incluir secretos, tokens, DNI/CUIT reales, documentos judiciales reales ni datos personales sensibles en el repositorio.
8. No editar archivos generados, `node_modules` ni el lockfile de forma manual.
9. Preservar los cambios ajenos del árbol de trabajo. Revisar `git status --short` antes y después de modificar código.
10. Ejecutar `npm run lint` y, para cambios de interfaz o build, `npm run build` antes de dar por terminado un cambio cuando las dependencias estén disponibles.

## Convenciones de dominio

- Usar español en textos de interfaz y nombres de estados del dominio que ya están establecidos.
- `LegalCase` representa un expediente. Antes de introducir una nueva relación jurídica, consultar `../Modelo de datos Estudio Guzman.docx`.
- Un contacto puede participar en varios expedientes y, a futuro, un expediente puede tener varias partes. No reforzar el supuesto de un único actor y demandado en nuevas implementaciones.
- Las fechas de eventos y auditoría deben usar ISO 8601. Elegir `date` para fechas sin hora y `timestamptz` para eventos con hora cuando se agregue backend.
- La auditoría debe ser append-only y registrarse en servidor cuando exista API.

## Flujo de trabajo recomendado

1. Describir brevemente el cambio y localizar las entidades y pantallas afectadas.
2. Implementar el cambio mínimo coherente.
3. Actualizar tipos, estado, mocks y documentación cuando el contrato cambie.
4. Verificar con lint, build y una revisión visual si se modifica UI.
5. Actualizar `docs/PROGRESS.md` con el resultado, las decisiones y los pendientes que surjan.

## Definición de terminado

Un cambio está terminado cuando compila, no rompe los flujos existentes, utiliza los componentes locales de shadcn/ui, maneja estados vacíos y errores relevantes, y deja actualizada la documentación cuando modifica alcance o arquitectura.
