# Progreso del proyecto

## Cómo usar este registro

Agregar una entrada cada vez que se complete una funcionalidad, se tome una decisión de arquitectura o aparezca un bloqueo. Mantener el historial: no reemplazar entradas anteriores. Para tareas en curso, actualizar la sección correspondiente hasta completarlas.

Estados permitidos: **Hecho**, **En curso**, **Pendiente**, **Bloqueado**.

## Estado general

| Área | Estado | Situación actual |
|---|---|---|
| Base frontend | Hecho | React, Vite, TypeScript, Tailwind y shadcn/ui ya configurados. |
| Navegación y layout | Hecho | Sidebar, header y rutas principales disponibles. |
| Datos mockeados | Hecho | Usuarios, contactos, expedientes, actuaciones, cuadernos, tareas, notas y logs. |
| Persistencia local | Hecho | Estado guardado en `localStorage`. |
| Base de datos y API | Pendiente | No existen en el proyecto. |
| Autenticación y permisos | Pendiente | El usuario actual es simulado. |
| Archivos reales | Pendiente | Los PDFs se simulan mediante `hasFile`. |
| Pruebas automatizadas | Pendiente | No hay suite de tests configurada. |

## Registro de avances

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
| P0 | Elegir backend, proveedor de autenticación y base de datos | Pendiente | Definir infraestructura y requisitos de privacidad. |
| P0 | Implementar esquema relacional y migraciones | Pendiente | Validar el modelo de datos y roles procesales. |
| P0 | Implementar autenticación y autorización | Pendiente | Matriz de permisos por rol. |
| P1 | Reemplazar `clientId` y `opponentId` por partes procesales | Pendiente | Definir roles, representantes y reglas de carátula. |
| P1 | API para expedientes, contactos, actuaciones y tareas | Pendiente | Backend y contratos de validación. |
| P1 | Adjuntos reales y acceso seguro a documentos | Pendiente | Elegir almacenamiento y política de retención. |
| P1 | Completar CRUD de contactos y edición de expedientes | Pendiente | API y criterios de validación. |
| P2 | Vista de lista de tareas y filtros avanzados | Pendiente | Definir campos y ordenamientos necesarios. |
| P2 | Pruebas, observabilidad y backups | Pendiente | Arquitectura de despliegue definida. |

## Bloqueos activos

No hay bloqueos técnicos activos. Las decisiones de infraestructura, permisos, roles procesales y retención documental deben resolverse antes de usar datos reales.

## Próxima actualización

Al iniciar la capa de backend, registrar: tecnología elegida, esquema de autenticación, entorno de despliegue, migraciones creadas y contrato API inicial.
