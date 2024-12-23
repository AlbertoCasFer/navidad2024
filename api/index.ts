import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const DATA_FILE = path.join(__dirname, '../data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
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

// Catch-all route to serve index.html
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default (req: VercelRequest, res: VercelResponse) => {
	app(req as any, res as any);
};
