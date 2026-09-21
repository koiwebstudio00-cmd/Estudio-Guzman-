# Despliegue del frontend en Vercel

La SPA se publica desde GitHub en Vercel y consume la API desplegada en Dokploy.

## Dominios

- frontend: `https://guzman.koistudio.com.ar`;
- API: `https://api-guzman.koistudio.com.ar/api/v1`.

## Configuración inicial

1. Importar en Vercel el repositorio privado del frontend.
2. Seleccionar **Vite** como framework y la raíz del repositorio como Root Directory.
3. Conservar `npm run build` como Build Command y `dist` como Output Directory. `vercel.json` ya los declara y agrega el fallback de React Router.
4. En **Settings → Environment Variables**, crear para **Production**:

   ```dotenv
   VITE_API_URL=https://api-guzman.koistudio.com.ar/api/v1
   ```

5. No agregar cookies, contraseñas ni credenciales al frontend. Toda variable `VITE_*` queda embebida y visible en el JavaScript del navegador.

## Preview deployments

No conectar previews a la API productiva. Para Preview hay dos opciones seguras:

- configurar `VITE_API_URL` con una API de staging y datos sintéticos; o
- no probar flujos de API hasta disponer de ese ambiente.

El backend debe agregar el dominio concreto de staging/preview a `CORS_ORIGIN`; no se permiten comodines productivos. Como las URLs aleatorias de Preview cambian, se recomienda un alias estable de staging.

## Dominio personalizado

1. En **Settings → Domains**, agregar `guzman.koistudio.com.ar`.
2. Crear en el proveedor DNS exactamente el registro que indique Vercel.
3. Esperar la validación del dominio y del certificado HTTPS.
4. Confirmar que el backend productivo tenga:

   ```dotenv
   CORS_ORIGIN=https://guzman.koistudio.com.ar
   COOKIE_SECURE=true
   COOKIE_SAMESITE=lax
   ```

No es necesario definir `COOKIE_DOMAIN`: la cookie puede permanecer host-only en la API y `fetch` la envía porque el cliente usa `credentials: 'include'`.

## Verificación posterior

1. Abrir `https://guzman.koistudio.com.ar` y comprobar que una ruta interna cargada directamente no devuelve 404.
2. Iniciar sesión y verificar en DevTools que las llamadas van a `https://api-guzman.koistudio.com.ar/api/v1`.
3. Confirmar que no hay errores CORS y que la cookie de sesión es `HttpOnly` y `Secure`.
4. Refrescar una ruta protegida y comprobar que la sesión se recupera.
5. Probar login, dashboard, una consulta, una mutación con CSRF y logout.

## Deploys posteriores

Vercel crea un deployment por cada commit de la rama configurada y promociona la rama productiva al dominio. Antes de promover un cambio ejecutar:

```bash
npm run lint
npm test
npm run build
```

Si una versión falla, usar el rollback/promote de Vercel hacia un deployment anterior compatible con el contrato actual de la API.
