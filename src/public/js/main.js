// Creamos una instancia de socket.io del lado del cliente:

const socket = io();

// Creamos una variable para guardar el usuario
let user;
const chatBox = document.getElementById("message-input");

//  Utilizamos  Sweet Alert para el mensaje de bienvenida

// Swal es un objeto global que nos permite usar los metodos de la libreria
// Fire es el metodo que nos permite configurar el alerta

Swal.fire({
	title: "Identificate",
	input: "text",
	text: "Ingresa un nombre de usuario para poder utilizar el chat",
	inputValidator: (value) => {
		return !value && "Necesitas escribir un nombre para continuar!"
	},
	allowOutsideClick: false
}).then(result => {
	user = result.value;
	socket.emit("logIn",{user:result.value});
});

function sendMessage() {
	// Solo cuando se presiona enter envio el mensaje
	if(chatBox.value.trim().length > 0) {
		// Si el mensaje, despues de quitar espacios, tiene mas de 0 caracteres
		// lo enviamos al servidor
		socket.emit("message",{message: chatBox.value});
		chatBox.value = "";
	}
}

chatBox.addEventListener("keydown", (event) => {
	if(event.key === "Enter") {
		// Prevenir el comportamiento por defecto (no agregar nueva línea) si no se presiona Shift
		if (!event.shiftKey) {
			event.preventDefault();  // Evitar el salto de línea en el textarea
			sendMessage();           // Ejecutar la función para enviar el mensaje
		}
	}
})

// Listener de Mensajes:

socket.on("messagesLogs", data => {
	const log = document.getElementById("chat-container");
	let messages = "";
	data.forEach(message => {
		messages = messages + `		
	<div class="message ${message.user==user?"sender":"recipient"}">
		<span class="username">${message.user}:</span>
		<span class="text">${message.message}</span>
		<div class="timestamp">${String((new Date(message.date)).getHours()).padStart(2,'0')}:${String((new Date(message.date)).getMinutes()).padStart(2,'0')}</div>
	</div>
		`;
	});
	log.innerHTML = messages;
	log.scrollTop = log.scrollHeight;
})