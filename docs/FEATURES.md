# Funcionalidades del producto

## Criterio de estado

- **Disponible:** existe en la interfaz actual y funciona con estado local.
- **Parcial:** se muestra o se simula, pero el flujo no está completo.
- **Pendiente:** debe diseñarse e implementarse.

## Gestión de expedientes

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Listar expedientes | Disponible | Buscar por carátula o número; filtrar por fuero y estado. |
| Crear expediente | Disponible | Registrar carátula, número, fuero, estado, fecha de inicio, partes, juzgado, oficina de gestión y responsable. |
| Ver detalle del expediente | Disponible | Mostrar resumen, línea de tiempo, tareas, notas, pruebas e incidentes. |
| Editar expediente | Pendiente | Actualizar datos, reasignar responsable, cerrar, archivar y conservar trazabilidad. |
| Múltiples partes procesales | Pendiente | Permitir varios actores, demandados, letrados, representantes, peritos y testigos por expediente. |
| Historial de estados | Pendiente | Registrar el cambio de estado, fecha, usuario y motivo. |
| Búsqueda avanzada | Pendiente | Filtrar por parte, responsable, juzgado, rango de fechas, vencimientos y texto de actuaciones. |

## Actuaciones y documentos

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Línea de tiempo del expediente | Disponible | Ordenar actuaciones por fecha del documento. |
| Crear actuación | Parcial | Registrar título, tipo y fecha; la carga de PDF es visual y no persiste un archivo real. |
| Tipos de actuación | Disponible | Demanda, contestación, cédula, decreto, resolución, presentación, oficio, notificación y otro. |
| Adjuntar documentos | Pendiente | Subir uno o varios archivos, almacenar metadatos, restringir acceso y permitir descarga segura. |
| Actuaciones en cuadernos | Pendiente | Asociar una actuación al expediente principal o a un cuaderno específico. |
| Versionado y reemplazo | Pendiente | Mantener historial de documentos sin perder el archivo original. |

## Cuadernos e incidentes

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Mostrar cuadernos de prueba e incidentes | Disponible | Visualizar los vinculados a un expediente. |
| Crear y editar cuadernos | Pendiente | Definir tipo, título, estado, descripción y fechas. |
| Navegar el contenido del cuaderno | Pendiente | Consultar actuaciones, documentos, tareas y notas propias del cuaderno. |

## Tareas y vencimientos

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Tablero Kanban | Disponible | Agrupar por Pendiente, En progreso y Completada. |
| Crear tarea | Disponible | Definir título, descripción, responsable, vencimiento, prioridad y expediente opcional. |
| Cambiar estado | Disponible | Actualizar el estado desde el detalle de la tarea. |
| Vista de lista | Parcial | Actualmente informa que está en desarrollo. |
| Vencimientos y alertas | Parcial | El dashboard calcula tareas vencidas y del día; faltan notificaciones configurables. |
| Tareas por cuaderno | Pendiente | Asociar y filtrar tareas por cuaderno o incidente. |
| Reasignación, comentarios y adjuntos | Pendiente | Registrar responsables históricos, colaboración y evidencias. |

## Contactos y partes

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Directorio de contactos | Disponible | Buscar por nombre, DNI o CUIT y filtrar por tipo. |
| Conteo de expedientes relacionados | Disponible | Mostrar cuántos expedientes tienen a un contacto como parte en el modelo actual. |
| Alta y edición desde interfaz | Pendiente | El contexto soporta operaciones, pero el botón actual no abre un flujo. |
| Persona y organización | Pendiente | Validar y distinguir datos de personas humanas, empresas y otras organizaciones. |
| Datos de contacto múltiples | Pendiente | Soportar varios teléfonos, correos y direcciones por contacto. |

## Equipo, permisos y trazabilidad

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Panel de equipo | Disponible | Mostrar expedientes activos, tareas pendientes y vencidas por integrante. |
| Usuario actual simulado | Disponible | Se selecciona desde el estado local; no hay inicio de sesión real. |
| Registro de actividad | Disponible | Registrar altas y ciertas actualizaciones en memoria/localStorage. |
| Autenticación | Pendiente | Inicio de sesión seguro, recuperación de cuenta y cierre de sesión. |
| Autorización por rol | Pendiente | Definir permisos para jefe, socia, abogada, secretaria y roles futuros. |
| Auditoría completa | Pendiente | Guardar actor, acción, entidad, antes/después, fecha e identificador de solicitud. |

## Dashboard

| Funcionalidad | Estado | Alcance esperado |
|---|---|---|
| Indicadores operativos | Disponible | Juicios activos, tareas pendientes, vencidas y clientes activos. |
| Mis tareas | Disponible | Mostrar tareas abiertas de la persona actual. |
| Actividad reciente | Disponible | Mostrar los últimos eventos de la bitácora. |
| Métricas y reportes | Pendiente | Filtros temporales, carga por profesional, productividad y exportación. |

## Requisitos transversales antes de producción

- Persistencia con API y base de datos relacional.
- Validación de formularios en cliente y servidor.
- Control de acceso, auditoría y política de sesiones.
- Almacenamiento de archivos con URLs firmadas y política de retención.
- Copias de seguridad, observabilidad y manejo de errores.
- Pruebas unitarias, de integración y de flujos críticos.
- Accesibilidad de teclado, etiquetas de formularios y diseño responsive.
