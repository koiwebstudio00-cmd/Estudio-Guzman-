# Stack tecnológico

## Resumen

El proyecto es una SPA React/Vite conectada por HTTP a la API Node/Express y PostgreSQL. Ya no contiene persistencia funcional en `localStorage` ni datos mock en el bundle productivo.

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
| Formularios de fecha | React Day Picker e `Intl` | Calendarios y formato localizado. |
| Notificaciones | Sonner | Toasts de éxito, error e información. |
| Utilidades CSS | class-variance-authority, clsx, tailwind-merge | Variantes y composición segura de clases. |
| Persistencia | API REST + PostgreSQL | Estado validado, autorizado y auditable en backend. |
| Tests unitarios/componentes | Vitest 5, Testing Library y jsdom | Verificación rápida de utilidades y componentes React. |
| Tests E2E | Playwright 1.63 | Flujos reales en Chromium contra Vite. |
| Cobertura | V8/LCOV | Señal orientativa, sin sustituir casos críticos. |
| Hosting frontend | Vercel | Build Vite, dominio público y fallback de rutas SPA. |
| Hosting backend | Dokploy sobre VPS | API, worker, PostgreSQL, archivos privados y ClamAV. |

## shadcn/ui como estándar de componentes

La interfaz debe usar shadcn/ui como estándar. El proyecto ya contiene `components.json` y componentes fuente en `src/components/ui`, entre ellos `button`, `card`, `dialog`, `input`, `select`, `table`, `tabs`, `textarea`, `calendar`, `badge` y `sonner`.

shadcn/ui no funciona como una biblioteca visual cerrada: los componentes se incorporan como código fuente al proyecto. Esto permite adaptar accesibilidad, estilos y comportamiento sin depender de una abstracción externa. Por esa razón:

- Reutilizar primero `src/components/ui/*`.
- Para agregar un componente faltante, usar `npx shadcn@latest add <componente>` y revisar el resultado antes de integrarlo.
- No reemplazar componentes existentes con librerías alternativas sin una decisión explícita de arquitectura.
- Mantener la configuración de `components.json`, los alias y el helper `cn` de `src/lib/utils.ts` alineados.

## Arquitectura actual

```text
React pages/features
    ↓
apiRequest (cookie HttpOnly + CSRF)
    ↓
API Express / servicios / Prisma / PostgreSQL
```

Cada dominio tiene tipos y cliente API en `src/features`. `AuthContext` conserva únicamente el estado de sesión en memoria; los datos funcionales se obtienen de la API y la concurrencia se controla con versiones.

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
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm run preview
```

La primera ejecución E2E requiere `npx playwright install chromium`.

Si Vite falla por una dependencia opcional de Rollup en macOS Apple Silicon, eliminar únicamente `node_modules` y `package-lock.json` dentro de la carpeta del proyecto, ejecutar `npm install` y luego `npm run dev`.

## Dependencias revisadas

En Fase 12 se retiraron `@google/genai`, `motion`, `date-fns`, `dotenv`, `express` y `@types/express` porque no tenían uso funcional. El gate final incluye auditoría de runtime y build de producción.
