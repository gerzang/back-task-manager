const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./index');

const FILE_PATH = path.join(__dirname, 'tasks.json');

describe('API REST de Gestor de Tareas - Pruebas de Integración', () => {
  let originalFileContent = null;
  let createdTaskId = null;

  // Respaldar tasks.json para no alterar los datos de producción/desarrollo del usuario
  beforeAll(() => {
    if (fs.existsSync(FILE_PATH)) {
      originalFileContent = fs.readFileSync(FILE_PATH, 'utf8');
    }
    // Inicializar con un estado controlado para las pruebas
    const initialTasks = [
      { id: 1, title: 'Tarea Semilla 1', isCompleted: false },
      { id: 2, title: 'Tarea Semilla 2', isCompleted: true }
    ];
    fs.writeFileSync(FILE_PATH, JSON.stringify(initialTasks, null, 2), 'utf8');
  });

  // Restaurar el estado original del archivo tasks.json después de terminar
  afterAll(() => {
    if (originalFileContent !== null) {
      fs.writeFileSync(FILE_PATH, originalFileContent, 'utf8');
    } else if (fs.existsSync(FILE_PATH)) {
      fs.unlinkSync(FILE_PATH);
    }
  });

  // 1. Validar GET /tasks
  test('GET /tasks - Debe retornar un arreglo y status 200', async () => {
    const response = await request(app).get('/tasks');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('isCompleted');
  });

  // 2. Validar POST /tasks
  test('POST /tasks - Debe crear una tarea correctamente', async () => {
    const newTask = {
      title: 'Aprender Supertest para QA',
      isCompleted: false
    };

    const response = await request(app)
      .post('/tasks')
      .send(newTask);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newTask.title);
    expect(response.body.isCompleted).toBe(false);

    // Guardar el ID de la tarea creada para las siguientes pruebas
    createdTaskId = response.body.id;
  });

  // 3. Validar PUT /tasks/:id
  test('PUT /tasks/:id - Debe actualizar el estado de la tarea creada', async () => {
    expect(createdTaskId).not.toBeNull();

    const updatedData = {
      title: 'Aprender Supertest para QA (Actualizado)',
      isCompleted: true
    };

    const response = await request(app)
      .put(`/tasks/${createdTaskId}`)
      .send(updatedData);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(createdTaskId);
    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.isCompleted).toBe(true);
  });

  // 4. Validar DELETE /tasks/:id
  test('DELETE /tasks/:id - Debe eliminar la tarea creada', async () => {
    expect(createdTaskId).not.toBeNull();

    const deleteResponse = await request(app)
      .delete(`/tasks/${createdTaskId}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toHaveProperty('message');
    expect(deleteResponse.body.message).toContain(`Tarea con ID ${createdTaskId} eliminada`);

    // Validar que la tarea ya no exista realizando un GET
    const getResponse = await request(app).get(`/tasks/${createdTaskId}`);
    expect(getResponse.statusCode).toBe(404);
  });

  // 5. Validar respuestas de error por ID inexistente
  test('GET /tasks/:id - Debe retornar 404 para un ID que no existe', async () => {
    const response = await request(app).get('/tasks/9999');
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
