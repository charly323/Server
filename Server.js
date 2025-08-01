// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const EVENTOS_FILE = path.join(__dirname, 'eventos.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir archivos estáticos

// Función para leer eventos del archivo
async function leerEventos() {
  try {
    const data = await fs.readFile(EVENTOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, devolver array vacío
    return [];
  }
}

// Función para guardar eventos al archivo
async function guardarEventos(eventos) {
  try {
    await fs.writeFile(EVENTOS_FILE, JSON.stringify(eventos, null, 2));
    return true;
  } catch (error) {
    console.error('Error guardando eventos:', error);
    return false;
  }
}

// GET - Obtener todos los eventos
app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await leerEventos();
    res.json({ success: true, eventos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener eventos' });
  }
});

// POST - Crear nuevo evento
app.post('/api/eventos', async (req, res) => {
  try {
    const { nombre, fecha } = req.body;
    
    if (!nombre || !fecha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y fecha son requeridos' 
      });
    }

    const eventos = await leerEventos();
    const nuevoEvento = {
      id: Date.now(), // ID simple basado en timestamp
      nombre,
      fecha,
      creado: new Date().toISOString()
    };

    eventos.push(nuevoEvento);
    
    const guardado = await guardarEventos(eventos);
    
    if (guardado) {
      res.json({ success: true, evento: nuevoEvento });
    } else {
      res.status(500).json({ success: false, error: 'Error al guardar evento' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar evento
app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventos = await leerEventos();
    
    const eventosFiltrados = eventos.filter(evento => evento.id !== parseInt(id));
    
    if (eventos.length === eventosFiltrados.length) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }
    
    const guardado = await guardarEventos(eventosFiltrados);
    
    if (guardado) {
      res.json({ success: true, message: 'Evento eliminado correctamente' });
    } else {
      res.status(500).json({ success: false, error: 'Error al eliminar evento' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar evento
app.put('/api/eventos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha } = req.body;
    
    if (!nombre || !fecha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y fecha son requeridos' 
      });
    }

    const eventos = await leerEventos();
    const indiceEvento = eventos.findIndex(evento => evento.id === parseInt(id));
    
    if (indiceEvento === -1) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }
    
    eventos[indiceEvento] = {
      ...eventos[indiceEvento],
      nombre,
      fecha,
      actualizado: new Date().toISOString()
    };
    
    const guardado = await guardarEventos(eventos);
    
    if (guardado) {
      res.json({ success: true, evento: eventos[indiceEvento] });
    } else {
      res.status(500).json({ success: false, error: 'Error al actualizar evento' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Los eventos se guardan en: ${EVENTOS_FILE}`);
});

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('👋 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Cerrando servidor...');
  process.exit(0);
});