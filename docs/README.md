# Estudio Guzman

## Descripción del proyecto

Estudio Guzman es un sistema web de gestión interna para un estudio jurídico. Centraliza la operación diaria alrededor de los expedientes: partes involucradas, radicación judicial, actuaciones, cuadernos de prueba o incidentes, tareas, notas internas y actividad del equipo.

El repositorio contiene actualmente un MVP frontend. La información se mantiene en memoria y se guarda en el navegador mediante `localStorage`; no hay una API, autenticación real ni base de datos conectada. Los registros iniciales son datos mockeados para demostrar los flujos principales.

## Objetivo de producto

Reducir el trabajo disperso entre planillas, mensajería y documentos, ofreciendo una vista única y ordenada del estado de cada expediente y de las tareas del equipo. La aplicación debe ayudar a saber:

- qué expedientes están activos y quién los tiene asignados;
- quiénes son las partes y dónde tramita cada causa;
- cuáles fueron las últimas actuaciones y documentos;
- qué tareas vencen, están pendientes o fueron completadas;
- qué hizo cada integrante del estudio.

## Estado actual

La aplicación es una SPA en React con rutas para Inicio, Juicios, Nuevo Juicio, Detalle del juicio, Tareas, Contactos y Equipo. Los tipos de dominio están definidos en `src/types/index.ts`; los ejemplos de datos en `src/data/mockData.ts`; y el estado compartido en `src/store/AppContext.tsx`.

## Principios de desarrollo

- La información de expedientes y contactos es sensible: evitar datos ficticios en producción, exposición de secretos o logs con contenido confidencial.
- Las reglas de negocio deben vivir en servicios y en la base de datos, no solo en componentes de interfaz.
- La interfaz debe construirse sobre los componentes locales de shadcn/ui y Tailwind CSS, manteniendo accesibilidad y coherencia visual.
- Los cambios de modelo de datos deben quedar documentados y ser migrables.

## Documentación relacionada

- [Funcionalidades](FEATURES.md)
- [Stack tecnológico](STACK.md)
- [Progreso del proyecto](PROGRESS.md)
- [Instrucciones para agentes](AGENTS.md)
- [Instrucciones para Claude](CLAUDE.md)
- [Modelo de datos](../Modelo%20de%20datos%20Estudio%20Guzman.docx)
