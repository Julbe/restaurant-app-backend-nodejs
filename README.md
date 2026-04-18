# Restaurant Backend Node.js

API REST construida con Node.js, Express y MongoDB para la operación de un restaurante. El servidor está orientado a administrar usuarios, empleados, autenticación, sesiones, catálogo de menú, archivos en S3 y configuraciones generales consumidas por el frontend.

## Objetivo del proyecto

Este backend forma parte de una plataforma de gestión para restaurante. A nivel funcional, el servidor está preparado para cubrir necesidades como:

- administración de empleados y usuarios internos
- autenticación y control de sesiones
- gestión de roles y privilegios
- administración del menú mediante platillos, complementos, modificadores y combos
- carga y consulta de archivos en Amazon S3
- almacenamiento de configuraciones globales del sistema

Nota técnica: en la capa de privilegios existe el permiso `orders`, pero actualmente este repositorio no expone un módulo `/api/orders`.

## Stack

- Node.js
- Express 5
- MongoDB con Mongoose
- JWT para autenticación
- bcrypt para hash de contraseñas
- Amazon S3 para archivos y settings JSON
- Nodemon para desarrollo

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Una instancia de MongoDB accesible desde la app
- Un bucket de S3 configurado si se van a usar archivos o settings remotos

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto. Puedes partir de [`/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/.env.example`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/.env.example).

Variables usadas por el servidor:

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `PORT` | No | Puerto HTTP del servidor. Default: `3000`. |
| `NODE_ENV` | No | Ambiente de ejecución. Se usa como referencia informativa en `GET /`. |
| `PRODUCTION` | No | Flag que la API devuelve en algunos endpoints de diagnóstico. |
| `DB_CONNECTION` | Sí | String de conexión a MongoDB. |
| `JWT_SECRET` | Sí | Secreto usado para firmar y validar tokens JWT. |
| `BUCKET_NAME` | Sí, si se usa S3 | Nombre del bucket privado. |
| `BUCKET_REGION` | Sí, si se usa S3 | Región del bucket S3. |
| `BUCKET_ACCESS_KEY` | Sí, si se usa S3 | Access key con permisos sobre el bucket. |
| `BUCKET_SECRET_KEY` | Sí, si se usa S3 | Secret key con permisos sobre el bucket. |
| `BUCKET_URL` | No | URL pública base para archivos bajo el prefijo `public/`. |
| `SETTINGS_KEY` | No | Key del JSON de configuración en S3. Si no existe, usa el fallback definido en código. |

Ejemplo:

```env
PORT=3000
NODE_ENV=development
PRODUCTION=false

DB_CONNECTION=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_secure_secret

BUCKET_NAME=restaurant-assets
BUCKET_REGION=us-east-1
BUCKET_ACCESS_KEY=replace_with_access_key
BUCKET_SECRET_KEY=replace_with_secret_key
BUCKET_URL=https://restaurant-assets.s3.us-east-1.amazonaws.com/

SETTINGS_KEY=settings/app-settings.json
```

## Instalación y ejecución

1. Clona el repositorio:

```bash
git clone https://github.com/Julbe/restaurant-app-backend-nodejs.git
cd restaurant-app-backend-nodejs
```

2. Instala dependencias:

```bash
npm install
```

3. Crea tu archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

4. Ajusta las variables con tus credenciales reales.

5. Inicia el servidor en desarrollo:

```bash
npm run dev
```

Si quieres ejecutarlo sin `nodemon`:

```bash
node src/app.js
```

## Verificación rápida

Con el servidor arriba, puedes validar:

- `GET /` devuelve estado básico del servidor
- `GET /api` devuelve información de versión y release

Ejemplo local:

```bash
curl http://localhost:3000/
curl http://localhost:3000/api
```

## Autenticación

La autenticación usa JWT por medio de `Authorization: Bearer <token>`.

Endpoints clave:

- `POST /api/auth/login`
- `PATCH /api/auth/change-password`
- `GET /api/token`

El token incluye información del usuario autenticado, rol y privilegios habilitados. La expiración actual del token es de 1 hora.

## Estructura general de la API

Las rutas se registran automáticamente usando el nombre de cada carpeta dentro de `src/modules`. Por eso los prefijos reales quedan así:

| Prefijo | Descripción |
| --- | --- |
| `/api/auth` | Login y cambio de contraseña |
| `/api/user` | Usuarios del sistema |
| `/api/employee` | Empleados |
| `/api/roles` | Roles y privilegios |
| `/api/session` | Sesiones activas |
| `/api/dish` | Platillos |
| `/api/side` | Complementos o guarniciones |
| `/api/modifiers` | Modificadores de productos |
| `/api/combo` | Combos |
| `/api/files` | Archivos en S3 |
| `/api/news` | Noticias o contenido visible |
| `/api/AppSettings` | Configuración global guardada en S3 |

## Carga automática de controladores

[`managerController.js`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/src/modules/managerController.js) centraliza la carga automática de controladores del proyecto.

Su responsabilidad es:

- leer todas las carpetas dentro de `src/modules`
- buscar dentro de cada carpeta un archivo que termine en `.controller.js`
- importar dinámicamente ese controlador
- instanciarlo y registrarlo dentro del objeto global `Manager`
- exponer cada instancia con una clave derivada del nombre del folder

Ejemplo de resolución:

- `src/modules/employee/employee.controller.js` se registra como `Manager.Employee`
- `src/modules/roles/role.controller.js` se registra como `Manager.Role`
- `src/modules/session/session.controller.js` se registra como `Manager.Session`

Después, las rutas usan esas instancias para mapear endpoints hacia acciones CRUD, por ejemplo:

```js
route.get("/", verifyToken, Manager.Employee.getAll);
route.post("/", verifyToken, Manager.Employee.create);
```

### Relación con `BaseController`

[`BaseController`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/src/modules/baseController.js) es la clase base pensada para los controladores de cada módulo. Su objetivo es evitar repetir la lógica estándar de CRUD para modelos de MongoDB.

Define una capa genérica basada en un modelo de Mongoose y entrega estos métodos principales:

- `create`: crea un documento con `model.create(...)`
- `getAll`: lista documentos con filtros, búsqueda, paginación, sort y populate
- `getById`: obtiene un documento por id
- `update`: actualiza un documento con `findByIdAndUpdate`
- `delete`: elimina un documento por id

Además, `BaseController` permite extender comportamiento por módulo con hooks como:

- `beforeCreate`
- `afterCreate`
- `beforeGetAll`
- `afterGetAll`
- `beforeUpdate`
- `afterUpdate`
- `beforeDelete`
- `afterDelete`
- `afterGetById`

Eso hace posible que cada controlador mantenga una estructura consistente y solo sobrescriba la lógica específica del negocio cuando sea necesario.

Ejemplo conceptual:

```js
export default class EmployeeController extends BaseController {
  constructor() {
    super(EmployeeModel, "Empleado", ["name", "email"]);
  }
}
```

Importante: por convención, los controladores cargados por `managerController.js` deberían extender `BaseController` para heredar el CRUD estándar sobre MongoDB. Sin embargo, la implementación actual no valida en runtime si la clase realmente hereda de `BaseController`; simplemente importa cualquier archivo `*.controller.js` y crea una instancia de su export default.

## Carga automática de rutas

[`managerRoutes.js`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/src/modules/managerRoutes.js) es el encargado de registrar rutas automáticamente en Express.

Su flujo es:

- leer todas las carpetas de `src/modules`
- buscar en cada una un archivo con sufijo `.routes.js`
- importar dinámicamente el `router` exportado por default
- montar ese router en Express usando como prefijo `/api/<nombre-del-folder>`

Ejemplos:

- `src/modules/employee/employee.routes.js` se monta en `/api/employee`
- `src/modules/dish/dish.routes.js` se monta en `/api/dish`
- `src/modules/files/file.routes.js` se monta en `/api/files`

Esto permite que la API crezca por módulos sin tener que registrar manualmente cada ruta en `app.js`. Para agregar un nuevo módulo, normalmente basta con:

1. crear una carpeta dentro de `src/modules`
2. agregar un archivo `*.controller.js`
3. agregar un archivo `*.routes.js`
4. exportar un `Router` de Express por default

Con esa convención, `managerController.js` y `managerRoutes.js` integran automáticamente el módulo al servidor.

## Convenciones de respuesta

El proyecto usa un middleware que envuelve la mayoría de respuestas JSON bajo la forma:

```json
{
  "success": true,
  "data": {}
}
```

En endpoints paginados, la respuesta incluye metadatos:

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "results": 3,
  "data": []
}
```

## Paginación y filtros

Los controladores base soportan estos query params en listados:

- `page`
- `limit`
- `sortBy`
- `sortOrder`
- `q`
- `_fields`
- `populate`

Además, cualquier otro query param no reservado se usa como filtro directo sobre MongoDB.

Ejemplo:

```bash
curl "http://localhost:3000/api/employee?page=1&limit=20&sortBy=createdAt&sortOrder=desc"
```

## Estructura del proyecto

```text
src/
  app.js                  # bootstrap del servidor
  db.js                   # conexión a MongoDB
  middlewares/            # auth, manejo de errores, uploads, wrapper de respuesta
  modules/                # módulos de negocio y rutas
  services/               # integración con S3
  utils/                  # utilidades de soporte
  config/                 # privilegios y configuración estática
```

## Scripts disponibles

- `npm run dev`: levanta el servidor con `nodemon`
- `npm run release`: genera versión y changelog con `standard-version`

## Releases y versionado automático

El repositorio ya incluye configuración de [`semantic-release`](https://semantic-release.gitbook.io/semantic-release/) en [`/.releaserc.json`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/.releaserc.json).

La idea de este flujo es automatizar el versionado del proyecto a partir del historial de commits. Cuando se ejecuta `semantic-release` sobre la rama `main`, el proceso analiza los mensajes de commit y con base en ellos puede:

- calcular el siguiente número de versión
- generar o actualizar el `CHANGELOG.md`
- crear el tag de release en Git
- publicar la release en GitHub

### Cómo decide la versión

El versionado depende del tipo de commit:

- `fix:` genera normalmente un incremento `patch`
- `feat:` genera normalmente un incremento `minor`
- un commit con `BREAKING CHANGE:` o `!` en el tipo genera normalmente un incremento `major`

Ejemplos:

```bash
git commit -m "fix(auth): corregir validación del token expirado"
git commit -m "feat(employee): agregar filtro por sucursal"
git commit -m "feat(menu)!: reorganizar estructura de modifiers"
```

### Recomendación: usar Conventional Commits

Para que el versionado automático funcione de forma consistente, se recomienda usar el formato de [Conventional Commits](https://www.conventionalcommits.org/).

Estructura sugerida:

```text
tipo(scope): descripción corta
```

Tipos comunes para este proyecto:

- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `chore`: mantenimiento interno
- `refactor`: cambio interno sin alterar comportamiento esperado
- `docs`: cambios de documentación
- `test`: cambios en pruebas

Ejemplos recomendados:

```bash
git commit -m "feat(dish): agregar endpoint para consultar platillos activos"
git commit -m "fix(session): evitar renovar sesiones expiradas"
git commit -m "docs(readme): documentar managerController y managerRoutes"
git commit -m "refactor(employee): simplificar hooks del controlador"
git commit -m "chore(release): preparar flujo de versionado"
```

Si existe un cambio incompatible con versiones previas, se recomienda marcarlo explícitamente:

```bash
git commit -m "feat(user)!: cambiar estructura del payload de login"
```

O bien incluir una nota de ruptura en el cuerpo del commit:

```text
feat(user): cambiar estructura del payload de login

BREAKING CHANGE: el endpoint /api/auth/login ya no devuelve el campo roleName
```

### Nota sobre el estado actual del repositorio

Actualmente conviven dos piezas relacionadas con releases:

- el archivo [`/.releaserc.json`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/.releaserc.json), que define el flujo de `semantic-release`
- el script `npm run release` en [`package.json`](/Users/juliobeas/Desktop/repo/restaurant-app-backend-nodejs/package.json), que hoy ejecuta `standard-version`

Eso significa que la intención de versionado automático ya está presente, pero para que los tags y releases se generen completamente en automático normalmente hace falta ejecutar `semantic-release` desde CI sobre `main`.

## Estado actual

El proyecto no tiene pruebas automatizadas configuradas todavía. El script `npm test` actualmente no ejecuta una suite real.
