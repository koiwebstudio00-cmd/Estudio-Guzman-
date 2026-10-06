# Progreso del proyecto

## Cómo usar este registro

Agregar una entrada cada vez que se complete una funcionalidad, se tome una decisión de arquitectura o aparezca un bloqueo. Mantener el historial: no reemplazar entradas anteriores. Para tareas en curso, actualizar la sección correspondiente hasta completarlas.

Estados permitidos: **Hecho**, **En curso**, **Pendiente**, **Bloqueado**.

## Estado general

| Área | Estado | Situación actual |
|---|---|---|
| Base frontend | Hecho | React, Vite, TypeScript, Tailwind y shadcn/ui ya configurados. |
| Navegación y layout | Hecho | Sidebar, header y rutas principales disponibles. |
| Datos mockeados | Retirado | Eliminados del bundle productivo en Fase 12. |
| Persistencia local | Retirado | Sin estado funcional en `localStorage`. |
| Base de datos y API | Hecho | Módulos funcionales conectados a PostgreSQL mediante la API. |
| Autenticación y permisos | Hecho | Sesión opaca, CSRF, RBAC y recuperación. |
| Archivos reales | Hecho | PDFs privados, versiones, checksum y antivirus. |
| Pruebas automatizadas | Hecho | Vitest, Testing Library, cobertura V8 y smoke Playwright ejecutables localmente. |

## Registro de avances

### 2026-10-05 — Gestión de cuadernos y actuaciones — Hecho

- Se incorporó edición de título y descripción de cuadernos con optimistic locking.
- El detalle del cuaderno centraliza creación de actuaciones, edición y transiciones de estado con motivo.
- Las actuaciones pueden abrirse desde el timeline o desde el cuaderno y editar sus metadatos según permisos y autoría.
- Los cuadernos cerrados y expedientes archivados muestran explícitamente el modo de sólo lectura.
- Se agregaron acciones de baja con confirmación para juicios, cuadernos y actuaciones. La baja de actuaciones exige motivo; juicios y cuadernos sólo pueden eliminarse cuando no tienen actividad vinculada.
- Se agregó cobertura de integración y E2E para edición, navegación y restricciones por estado.

### 2026-10-02 — Edición de perfiles y contraseñas — Hecho

- Cada usuario puede actualizar nombre, email y avatar desde “Mi perfil” usando optimistic locking.
- El cambio de contraseña propia exige la contraseña actual y cierra todas las sesiones para requerir un nuevo ingreso.
- Los usuarios con `users.manage` pueden editar los datos y asignar una nueva contraseña a otro integrante desde “Equipo”.
- Las contraseñas nunca vuelven al frontend ni se incorporan a auditoría; los cambios administrativos revocan las sesiones afectadas.

### 2026-09-21 — Página de Actividad — Hecho

- Se agregó la ruta protegida `/actividad`, visible únicamente para usuarios con `audit.read`.
- La pantalla consulta la auditoría completa con filtros por módulo y rango inclusivo de fechas, y pagina mediante cursor.
- El dashboard conserva su resumen de actividad relevante y enlaza al historial completo sólo para usuarios autorizados.
- Se agregó cobertura E2E para filtros, detalle técnico y carga de páginas adicionales.

### 2026-09-21 — Preparación de despliegue — Hecho

- Se configuró Vercel para construir la SPA, resolver rutas de React Router y aplicar headers defensivos básicos.
- Se documentaron el dominio productivo, `VITE_API_URL`, la separación de previews/staging y la verificación posterior al deploy.
- El frontend se publicará en `guzman.koistudio.com.ar` y consumirá la API de Dokploy en `api-guzman.koistudio.com.ar`.

### 2026-09-19 — Fases 3 a 12 — Hecho

- Se conectaron autenticación, equipo/RBAC, contactos, expedientes, timeline, documentos, tareas, notas, dashboard, búsqueda, métricas, notificaciones y feedback.
- Se eliminó `AppContext`, `localStorage` funcional y todo el dataset mock del bundle.
- Se completaron hardening, contratos, runbooks y gates automatizados para entrega local por ramas acumulativas.

### 2026-09-18 — Fase 2: harness de pruebas — Hecho

- Se agregaron suites unitarias y de componentes con Vitest, Testing Library y jsdom.
- Se incorporó cobertura V8/LCOV como señal orientativa.
- Se preparó Playwright y un smoke E2E del dashboard en Chromium.
- Se definió una batería local reproducible con tipos, tests, cobertura, build y E2E.
- El backend incorporó tests unitarios/API/integración, migración automática y aislamiento sobre `estudio_guzman_test`.

### 2026-09-17 — Fases 0 y 1 del backend — Hecho

- Se relevó el comportamiento real del frontend, sus tipos y datos mockeados.
- Se aprobaron la matriz RBAC granular, los roles procesales y las reglas de acceso por recurso.
- Se cerraron las máquinas de estado para expedientes, cuadernos, tareas y usuarios.
- Se creó y validó la migración inicial sobre PostgreSQL 17.
- Se incorporaron el seed RBAC idempotente, roles DB separados y el bootstrap seguro del primer administrador.
- Se documentaron operación, restauración y preparación de PostgreSQL local sin Docker obligatorio.

### 2026-09-16 — Auditoría de Lamelas y fundación ejecutable — Hecho

- Se auditó en detalle `back-lamelas`: módulos, servicios, scripts, dependencias, tests, Docker, migraciones y operación.
- Se documentó qué patrones se reutilizan, cuáles se adaptan y qué componentes específicos del SaaS inmobiliario se descartan.
- Se creó el backend Node.js 22, Express 5, TypeScript estricto, Prisma 7/PostgreSQL, Zod, Pino y Vitest.
- Se incorporaron configuración fail-fast, errores RFC 7807, request IDs, liveness/readiness, graceful shutdown y storage privado protegido contra path traversal.
- Se agregó Docker multi-stage, Compose de desarrollo, seed inicial de RBAC, lockfile propio y scripts de base de datos.
- Prisma, lint, typecheck, build, pruebas y auditoría de runtime quedaron validados; el runtime informa 0 vulnerabilidades.

### 2026-09-16 — Diseño de backend, base de datos y API — Hecho

- Se copió el frontend al workspace de arquitectura sin dependencias ni artefactos generados.
- Se relevó el dominio completo y las brechas entre el mock local y un sistema productivo.
- Se diseñó PostgreSQL con Prisma para autenticación, RBAC, contactos, partes múltiples, expedientes, actuaciones, cuadernos, tareas, notas, archivos versionados, auditoría y notificaciones.
- Se definió el contrato REST `/api/v1`, los servicios del monolito modular y la topología recomendada para VPS.
- Se documentaron seguridad de archivos, backups, observabilidad, pruebas y fases de implementación.
- El esquema inicial fue formateado y validado con Prisma CLI 7.10.0.

### 2026-09-15 — Documentación inicial del producto — Hecho

- Se analizó el código actual, la estructura de pantallas, los tipos de dominio y los datos mockeados.
- Se generó el modelo de datos con entidades, relaciones, recomendaciones de integridad y secuencia de implementación.
- Se creó el conjunto inicial de documentación en `docs/`: descripción, funcionalidades, stack, guía de agentes, guía para Claude y este registro de progreso.

### Preexistente — MVP de gestión jurídica — Hecho

- Dashboard con métricas de expedientes, tareas y actividad reciente.
- Listado y creación local de expedientes.
- Detalle de expediente con actuaciones, cuadernos, tareas y notas.
- Tablero Kanban de tareas con cambio de estado.
- Directorio de contactos y panel de métricas por integrante.

## Próximas prioridades

| Prioridad | Trabajo | Estado | Dependencias o decisión requerida |
|---|---|---|---|
| P0 | Validar diseño de backend, autenticación y base de datos | Hecho | Decisiones funcionales y matriz RBAC aprobadas. |
| P0 | Implementar esquema relacional y migraciones | Hecho | Migración inicial y constraints validados sobre PostgreSQL 17. |
| P0 | Implementar autenticación y autorización | Pendiente | Matriz de permisos por rol. |
| P1 | Reemplazar `clientId` y `opponentId` por partes procesales | Pendiente | Definir roles, representantes y reglas de carátula. |
| P1 | API para expedientes, contactos, actuaciones y tareas | Pendiente | Backend y contratos de validación. |
| P1 | Adjuntos reales y acceso seguro a documentos | Pendiente | Elegir almacenamiento y política de retención. |
| P1 | Completar CRUD de contactos y edición de expedientes | Pendiente | API y criterios de validación. |
| P2 | Vista de lista de tareas y filtros avanzados | Pendiente | Definir campos y ordenamientos necesarios. |
| P2 | Pruebas automatizadas | Hecho | Harness frontend/backend y comandos locales reproducibles disponibles. |
| P2 | Observabilidad y backups | Pendiente | Se completa durante hardening/despliegue. |

## Bloqueos activos

No hay bloqueos de desarrollo. Falta la revisión manual del usuario por fase y, antes del go-live, ejecutar el ensayo de backup/restauración y smoke en el VPS/staging real.
