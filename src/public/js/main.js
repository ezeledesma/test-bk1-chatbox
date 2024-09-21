// Creamos una instancia de socket.io del lado del cliente:

const socket = io();

// Creamos una variable para guardar el usuario
let user;
const chatBox = document.getElementById("chatBox");

//  Utilizamos  Sweet Alert para el mensaje de bienvenida

// Swal es un objeto global que nos permite usar los metodos de la libreria
// Fire es el metodo que nos permite configurar el alerta

Swal.fire({
	title: "Identificate",
	input: "text",
	text: "Ingresa un usuario para identificarte en el chat",
	inputValidator: (value) => {
		return !value && "Necesitas escribir un nombre para continuar"
	},
	allowOutsideClick: false
}).then(result => {
	user = result.value;
});


chatBox.addEventListener("keyup", (event) => {
	if(event.key === "Enter") {
		// Solo cuando se presiona enter envio el mensaje
		if(chatBox.value.trim().length > 0) {
			// Si el mensaje, despues de quitar espacios, tiene mas de 0 caracteres
			// lo enviamos al servidor
			socket.emit("message",{user: user, message: chatBox.value});
			chatBox.value = "";
		}
	}
})

// Listener de Mensajes:

socket.on("messagesLogs", data => {
	const log = document.getElementById("messagesLogs");
	let messages = "";

	data.forEach(message => {
		message = messages + `${message.user} dice: ${message.message} <br>`;
	});

	log.innerHTML = messages;
	console.log(messages);
})