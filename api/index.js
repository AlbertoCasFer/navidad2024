const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

// Middleware para manejar JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.get('/api/data', (req, res) => {
	const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
	res.json(data);
});

app.post('/api/participate', (req, res) => {
	const { name } = req.body;
	const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
	const { participants, assigned } = data;

	if (assigned[name]) {
		return res.json({
			message: `¡Ya participaste! Te tocó: ${assigned[name]}.`,
		});
	}

	const availableNames = participants.filter(
		(p) => p !== name && !Object.values(assigned).includes(p),
	);

	if (availableNames.length === 0) {
		return res.status(400).json({ message: 'No hay nombres disponibles.' });
	}

	const assignedName =
		availableNames[Math.floor(Math.random() * availableNames.length)];
	assigned[name] = assignedName;

	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
	res.json({
		message: `¡Gracias por participar, ${name}! Te tocó: ${assignedName}.`,
	});
});

app.post('/api/reset', (req, res) => {
	const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
	data.assigned = {};
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
	res.json({ message: 'Las asignaciones han sido reiniciadas.' });
});

// Manejar cualquier otra ruta
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
