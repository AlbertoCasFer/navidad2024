const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

// Middleware para manejar JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Funciones para leer y guardar datos
const getData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const saveData = (data) =>
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Rutas
app.get('/api/data', (req, res) => {
	const data = getData();
	res.json(data);
});

app.post('/api/participate', (req, res) => {
	const { name } = req.body;
	const data = getData();
	const { participants, assigned } = data;

	// Verificar si ya participó
	if (assigned[name]) {
		return res.json({
			message: `¡Ya participaste! Te tocó: ${assigned[name]}.`,
		});
	}

	// Verificar nombres disponibles
	const availableNames = participants.filter(
		(p) => p !== name && !Object.values(assigned).includes(p),
	);

	if (availableNames.length === 0) {
		return res.status(400).json({ message: 'No hay nombres disponibles.' });
	}

	// Asignar un nombre aleatorio
	const randomIndex = Math.floor(Math.random() * availableNames.length);
	const assignedName = availableNames[randomIndex];
	assigned[name] = assignedName;

	// Guardar datos
	saveData({ participants, assigned });

	res.json({
		message: `¡Gracias por participar, ${name}! Te tocó: ${assignedName}.`,
	});
});

app.post('/api/reset', (req, res) => {
	const data = getData();
	data.assigned = {};
	saveData(data);
	res.json({ message: 'Las asignaciones han sido reiniciadas.' });
});

// Iniciar servidor
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
