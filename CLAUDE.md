# SkyBu Front

Frontend del SaaS multiempresa de ventas e inventario SkyBu (SvelteKit 3, Svelte 5 runes, Tailwind 4, Zod 4, Vitest).
Backend Spring en `D:\SoftwareProjects\SkyBu` (Swagger: http://localhost:8080/swagger-ui/index.html).
El encargo original está en `docs/instrucciones-iniciales.md`.

Responde y comenta el código en **español**.

## Reglas no negociables

1. **Separación de responsabilidades:** `+page.server.ts`, `+server.ts` y los hooks no contienen lógica de negocio. Solo parsean la entrada, llaman a un caso de uso y traducen el resultado.
2. **Inyección de dependencias por interfaces:** los casos de uso dependen de los puertos (`application/ports.ts`), nunca de `fetch`, cookies ni `$app/*`. Las implementaciones concretas se conectan solo en el composition root del módulo (`server/<modulo>-module.ts`).
3. **Errores centralizados y tipados:** lanza subclases de `AppError` (`src/lib/shared/errors/app-error.ts`). Captura solo con `instanceof` de la categoría concreta y deja que el resto llegue a `handleError` en `hooks.server.ts`. Prohibido el `try/catch` vacío o genérico.
4. **Validación de entrada y salida con Zod:**
   - Los formularios se leen con `parseFormData`.
   - Toda respuesta de la API se valida con un `responseSchema` en `HttpClient.send`.
5. **Código limpio y SOLID:**
   - Funciones pequeñas y nombres explícitos.
   - Comentarios que explican el *porqué*.
   - Sin `// TODO` ni código a medio terminar.
6. **Seguridad:**
   - Los tokens viven solo en cookies `httpOnly`; el navegador nunca los recibe.
   - Las redirecciones pasan por `toSafeRedirectPath`.
   - Las rutas de la API siempre van bajo `/api/`.
   - Nunca registres tokens, contraseñas ni valores de usuario en los logs.
   - Usa `{@html}` solo con contenido saneado.
7. **Código testeable:**
   - Cada caso de uso y cada adaptador lleva su `*.test.ts` (Vitest), con dobles de `testing/fakes.ts`.
   - Los tests no acceden a la red ni a la hora real (usa `Clock`).

## Arquitectura

```
src/lib/modules/<modulo>/
  domain/          lógica pura, sin dependencias de framework
  application/     ports.ts, dto/ (Zod), use-cases/
  server/          adaptadores HTTP, composition root, solo servidor
  presentation/    componentes y helpers de UI
  testing/         fakes
src/lib/shared/    errores, validación, seguridad, clock, logger
src/lib/server/    HttpClient, cliente de la API, cabeceras de seguridad
```

- Patrón BFF: el navegador solo habla con SvelteKit, y solo el servidor de SvelteKit llama a la API.
- **La autorización deniega por defecto:**
  - `RouteAccessPolicy` se evalúa en `hooks.server.ts`.
  - Grupos de rutas: `(public)` (sin sesión), `(guest)` (solo sin sesión) y `(app)` (requiere sesión).
  - Los permisos por ruta se declaran en `modules/auth/server/route-permission-rules.ts`.
- **En `load` y en las acciones:**
  - Llama a la API a través de `withSession(event, s => ...)`.
  - Usa `requirePermission(event, Permissions.x.y)` cuando la acción exige más permisos que la ruta.
- **En la UI:** `<Can requirement={...}>` o `can(...)`. Solo ocultan elementos de la interfaz; la seguridad real la aplican el servidor y la API.
- Los permisos siguen el formato `modulo:recurso:accion` y están en `modules/auth/domain/permissions.ts`.

## Particularidades de SvelteKit 3

- Las variables de entorno se declaran en `src/env.ts` (`defineEnvVars`) y se importan desde `$app/env/private`. `dev` se importa desde `$app/env`.
- `Handle` y `HandleServerError` vienen de `@sveltejs/kit/hooks`.
- `resolve()` de `$app/paths` recibe route IDs, por ejemplo `resolve('/(app)/iam/roles')`.
- Los imports `#lib/...` llevan extensión `.ts` explícita; los imports relativos van sin extensión.
- Un módulo es solo de servidor si está en `*.server.*` o dentro de una carpeta `/server/`.
- La CSP se configura en `vite.config.ts` (`csp`); las demás cabeceras, en `security-headers.ts`.

## Comandos

```sh
npm run dev       # requiere SKYBU_API_URL en .env (ver .env.example)
npm run check     # svelte-check, debe dar 0 errores y 0 avisos
npm run lint      # eslint + prettier
npm test          # vitest
```

Antes de dar una tarea por terminada, ejecuta `check`, `lint` y `test`.
