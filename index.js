const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const FILE_PATH = path.join(__dirname, 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helpers para lectura/escritura del archivo JSON
const readTasks = () => {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      // Si el archivo no existe, crearlo con un arreglo vacío
      fs.writeFileSync(FILE_PATH, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error al leer el archivo tasks.json:', error);
    return [];
  }
};

const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al escribir en el archivo tasks.json:', error);
    return false;
  }
};

// --- Endpoints ---

// 1. GET /tasks - Obtener todas las tareas
app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// 2. GET /tasks/:id - Obtener una tarea por ID
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID proporcionado no es válido' });
  }

  const tasks = readTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Tarea con ID ${id} no encontrada` });
  }

  res.json(task);
});

// 3. POST /tasks - Crear una nueva tarea
app.post('/tasks', (req, res) => {
  const { title, isCompleted } = req.body;

  // Validación básica del título
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'El título es requerido y debe ser una cadena de texto no vacía' });
  }

  const tasks = readTasks();

  // Generar ID autoincremental
  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

  const newTask = {
    id: newId,
    title: title.trim(),
    isCompleted: typeof isCompleted === 'boolean' ? isCompleted : false
  };

  tasks.push(newTask);

  if (writeTasks(tasks)) {
    res.status(201).json(newTask);
  } else {
    res.status(500).json({ error: 'No se pudo guardar la tarea en el almacenamiento local' });
  }
});

// 4. PUT /tasks/:id - Actualizar una tarea existente
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID proporcionado no es válido' });
  }

  const { title, isCompleted } = req.body;
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Tarea con ID ${id} no encontrada` });
  }

  // Validaciones opcionales si se envían los campos
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'El título debe ser una cadena de texto no vacía' });
  }
  if (isCompleted !== undefined && typeof isCompleted !== 'boolean') {
    return res.status(400).json({ error: 'El campo isCompleted debe ser un valor booleano (true/false)' });
  }

  // Actualizar propiedades
  if (title !== undefined) {
    tasks[taskIndex].title = title.trim();
  }
  if (isCompleted !== undefined) {
    tasks[taskIndex].isCompleted = isCompleted;
  }

  if (writeTasks(tasks)) {
    res.json(tasks[taskIndex]);
  } else {
    res.status(500).json({ error: 'No se pudo actualizar la tarea en el almacenamiento local' });
  }
});

// 5. DELETE /tasks/:id - Eliminar una tarea
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID proporcionado no es válido' });
  }

  let tasks = readTasks();
  const taskExists = tasks.some(t => t.id === id);

  if (!taskExists) {
    return res.status(404).json({ error: `Tarea con ID ${id} no encontrada` });
  }

  tasks = tasks.filter(t => t.id !== id);

  if (writeTasks(tasks)) {
    res.status(200).json({ message: `Tarea con ID ${id} eliminada exitosamente` });
  } else {
    res.status(500).json({ error: 'No se pudo eliminar la tarea en el almacenamiento local' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de tareas ejecutándose en http://localhost:${PORT}`);
});
