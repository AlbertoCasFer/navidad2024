// Selección de elementos del DOM
const form = document.getElementById('nameForm');
const nameInput = document.getElementById('nameInput');
const resultMessage = document.getElementById('resultMessage');

// URL del backend
const API_URL = '/api/participate';

// Manejar el envío del formulario
form.addEventListener('submit', async (event) => {
	event.preventDefault(); // Evita el reinicio de la página

	const name = nameInput.value.trim();

	if (!name) {
		resultMessage.textContent = 'Por favor, ingresa tu nombre.';
		return;
	}

	try {
		// Enviar solicitud al backend
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		});

		const data = await response.json();

		if (response.ok) {
			// Mostrar el mensaje de éxito
			resultMessage.textContent = data.message;
			nameInput.value = ''; // Limpiar el campo de entrada
		} else {
			// Mostrar errores del servidor
			resultMessage.textContent = data.message || 'Ocurrió un error.';
		}
	} catch (error) {
		console.error('Error:', error);
		resultMessage.textContent = 'Error al conectar con el servidor.';
	}
});
