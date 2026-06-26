# Gestor de Tareas (Backend)

API REST básica para un Gestor de Tareas desarrollada en **Node.js** y **Express**. Este sistema gestiona una entidad de tareas (`Task`) con almacenamiento local persistente en un archivo JSON.

## Características

- **Endpoints CRUD completos**: Crear, Leer, Actualizar y Eliminar tareas.
- **Persistencia local**: Todos los datos se guardan y leen automáticamente desde el archivo `tasks.json`.
- **CORS habilitado**: Configurado para permitir solicitudes desde cualquier origen (útil para conectar aplicaciones frontend).
- **Validaciones**: Protección básica para evitar la creación/edición de tareas sin datos válidos.

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- [Node.js](https://nodejs.org/) (versión 14 o superior recomendada)
- [npm](https://www.npmjs.com/) (generalmente viene con Node.js)

## Instalación

1. Clona este repositorio o ubícate en la carpeta raíz del proyecto.
2. Instala las dependencias del sistema ejecutando:
   ```bash
   npm install
   ```

## Ejecución del Servidor

Para iniciar el servidor localmente en el puerto `3001`, ejecuta:

```bash
npm start
```

Verás un mensaje indicando que el servidor está corriendo:
`Servidor de tareas ejecutándose en http://localhost:3001`

---

## Documentación de la API

La entidad `Task` tiene la siguiente estructura:
```json
{
  "id": 1,
  "title": "Nombre de la tarea",
  "isCompleted": false
}
```

### Endpoints Disponibles

| Método | Endpoint | Descripción | Body (JSON) | Respuesta (Código) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Obtener todas las tareas | N/A | `200 OK` - Listado de tareas |
| **GET** | `/tasks/:id` | Obtener una tarea por su ID | N/A | `200 OK` / `404 Not Found` |
| **POST** | `/tasks` | Crear una nueva tarea (ID autoincremental) | `{ "title": "Texto", "isCompleted": false }` | `201 Created` - Tarea creada / `400 Bad Request` |
| **PUT** | `/tasks/:id` | Actualizar título y/o estado de una tarea | `{ "title": "Nuevo título", "isCompleted": true }` | `200 OK` - Tarea modificada / `404 Not Found` |
| **DELETE**| `/tasks/:id` | Eliminar una tarea por su ID | N/A | `200 OK` - Mensaje de confirmación / `404 Not Found` |

### Ejemplos de Uso (usando cURL)

**Obtener tareas:**
```bash
curl http://localhost:3001/tasks
```

**Crear una tarea:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"title":"Mi nueva tarea"}' http://localhost:3001/tasks
```

**Actualizar estado de una tarea:**
```bash
curl -X PUT -H "Content-Type: application/json" -d '{"isCompleted":true}' http://localhost:3001/tasks/1
```

**Eliminar una tarea:**
```bash
curl -X DELETE http://localhost:3001/tasks/1
```

---

## Pruebas Automatizadas

El proyecto cuenta con una suite de pruebas de integración desarrolladas con **Jest** y **Supertest** para validar el correcto funcionamiento de todos los endpoints de la API.

### Ejecución de las Pruebas

Para ejecutar las pruebas automatizadas, utiliza el siguiente comando en tu terminal:

```bash
npm test
```

### ¿Qué validan las pruebas?

El archivo de pruebas `api.test.js` realiza las siguientes verificaciones:
1. **GET /tasks**: Valida que la API responda con un estado `200 OK` y devuelva un listado de tareas en formato de arreglo.
2. **POST /tasks**: Valida la correcta creación de una nueva tarea en la lista, verificando que se asigne un ID único y los valores ingresados.
3. **PUT /tasks/:id**: Valida la edición o actualización del estado (`isCompleted`) de una tarea previamente creada.
4. **DELETE /tasks/:id**: Valida que se remueva correctamente la tarea del almacenamiento y que los accesos posteriores a ese ID devuelvan un estado `404 Not Found`.

### Aislamiento de Datos (Base de Datos de Prueba)
La suite de pruebas está configurada para realizar un respaldo automático del archivo `tasks.json` antes de iniciar las ejecuciones y restaurarlo al finalizar (`beforeAll` y `afterAll`). De esta forma, **no se alteran ni pierden tus datos locales** de desarrollo o producción mientras se ejecutan los tests.