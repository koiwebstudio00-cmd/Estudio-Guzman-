# Stack tecnológico

## Resumen

El proyecto actual es una aplicación web de una sola página construida con React y Vite. No tiene servidor propio ni base de datos conectada: el estado de demostración se persiste en `localStorage`.

## Tecnologías en uso

| Capa | Tecnología | Uso actual |
|---|---|---|
| Runtime | Node.js | Desarrollo, scripts y dependencias de frontend. |
| Lenguaje | TypeScript 5 | Tipado de componentes, estado y entidades de dominio. |
| Framework UI | React 19 | Componentes y estado de la interfaz. |
| Build y desarrollo | Vite 6 | Servidor de desarrollo y build de producción. |
| Ruteo | React Router 7 | Rutas para dashboard, juicios, tareas, contactos y equipo. |
| Estilos | Tailwind CSS 4 | Utilidades de estilos y layout responsive. |
| Componentes | shadcn/ui, Base UI y Radix-compatible primitives | Componentes locales reutilizables en `src/components/ui`. |
| Iconos | Lucide React | Iconografía de la interfaz. |
| Formularios de fecha | React Day Picker y date-fns | Calendarios, fechas y formato localizado. |
| Notificaciones | Sonner | Toasts de éxito, error e información. |
| Utilidades CSS | class-variance-authority, clsx, tailwind-merge | Variantes y composición segura de clases. |
| Persistencia actual | localStorage | Estado serializado por `AppContext`. Solo apto para demo local. |

## shadcn/ui como estándar de componentes

La interfaz debe usar shadcn/ui como estándar. El proyecto ya contiene `components.json` y componentes fuente en `src/components/ui`, entre ellos `button`, `card`, `dialog`, `input`, `select`, `table`, `tabs`, `textarea`, `calendar`, `badge` y `sonner`.

shadcn/ui no funciona como una biblioteca visual cerrada: los componentes se incorporan como código fuente al proyecto. Esto permite adaptar accesibilidad, estilos y comportamiento sin depender de una abstracción externa. Por esa razón:

- Reutilizar primero `src/components/ui/*`.
- Para agregar un componente faltante, usar `npx shadcn@latest add <componente>` y revisar el resultado antes de integrarlo.
- No reemplazar componentes existentes con librerías alternativas sin una decisión explícita de arquitectura.
- Mantener la configuración de `components.json`, los alias y el helper `cn` de `src/lib/utils.ts` alineados.

## Arquitectura actual

```text
React pages
    ↓
AppContext
    ↓
Datos mockeados iniciales + localStorage del navegador
```

`AppContext` expone colecciones y operaciones de alta/actualización para contactos, expedientes, actuaciones, cuadernos, tareas y notas. Las pantallas consumen ese contexto directamente. Es útil para prototipado, pero no provee concurrencia, control de acceso, validaciones de servidor, backups ni trazabilidad confiable.

## Stack objetivo recomendado

La elección final debe validarse antes de iniciar implementación, pero la arquitectura necesita estas capacidades:

| Necesidad | Recomendación técnica |
|---|---|
| Base de datos | PostgreSQL relacional con migraciones y restricciones de integridad. |
| API | Backend TypeScript con validación de contratos y autorización por solicitud. Puede convivir con Vite o migrarse a un framework full stack según la decisión del equipo. |
| Autenticación | Proveedor compatible con sesiones seguras, recuperación de acceso y RBAC. |
| Archivos | Almacenamiento de objetos con URLs firmadas, metadatos en BDD y controles de acceso. |
| Validación | Esquemas compartidos cliente/servidor, por ejemplo Zod, además de constraints de base de datos. |
| Observabilidad | Logs estructurados, seguimiento de errores y auditoría inmutable de operaciones sensibles. |
| Pruebas | Unitarias para reglas de negocio, integración para API y E2E para flujos críticos. |

## Comandos de desarrollo

Ejecutar desde la raíz de `Estudio-Guzman-`:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Si Vite falla por una dependencia opcional de Rollup en macOS Apple Silicon, eliminar únicamente `node_modules` y `package-lock.json` dentro de la carpeta del proyecto, ejecutar `npm install` y luego `npm run dev`.

## Dependencias que requieren revisión

El `package.json` declara `@google/genai`, `dotenv` y `express`, pero no hay integración de servidor ni uso funcional de esas dependencias en el código relevado. Antes de usar o mantenerlas en producción, confirmar su propósito, versión y configuración de secretos.
