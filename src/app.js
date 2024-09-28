/* Chat comunitario - Comision 70230 */

// npm i express express-handlebars socket.io

import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
const app = express();
const PUERTO = 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"));

// Configuramos Express-Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.get("/", (req, res) => {
	//res.send("Hola Mundo");
	res.render("index");
})

// Listen
const httpServer = app.listen(PUERTO, () => {
	console.log(`Escuchando en el puerto http://localhost:${PUERTO}`);
})

// Generamos la instancia de Socket.io del lado del backend
const io = new Server(httpServer);

// Vamos a crear un array para almacenar todos los usuarios con sus mensajes;

let messages = [];
let clients = [];

io.on("connection", (socket) => {
	console.log("Nuevo usuario conectado");

	socket.on("message", data => {
		try {
			let user = clients.find((c) => c?.socket === socket);
			if(user) {
				// Si existe el usuario
				if(data.message == "__chatreset__") {
					messages = [];
				} else {
					messages.push({
						user: user.user,
						message: escapeHTML(data.message),
						date: Date.now()
					});
				}
				// Aca envio el array actualizado:
				io.emit("messagesLogs", messages); // Deberia solo enviarse a los sockets de clients logueados??
			} else {
				io.to(socket.id).emit("messagesLogs", [{user:"Server", message:"Por favor, logueese correctamente", date: Date.now()}]);
			}
		}
		catch (e) {
			console.log("error message", e);
		}
	})

	socket.on("logIn", data => {
		try {
			clients.push({
				socket: socket,
				user: escapeHTML(data.user)
			});
			// Si se logueo un usuario, le envio el chat para que lo cargue
			io.to(socket.id).emit("messagesLogs", messages); // Podria enviar a todos aviso que entro al chat
		}
		catch (e) {
			console.log("error logIn", e);
		}
	})

	socket.on("disconnect", (data) => {
		console.log("Usuario desconectado"); // Podria enviar a todos aviso que salio del chat
		try {
			let disconnected = clients.find((c) => c.socket === socket);
			if(disconnected) clients.splice(clients.indexOf(disconnected),1);
		}
		catch (e) {
			console.log("error disconnect", e);
		}
	})
})

// Función para escapar el contenido del mensaje.

function escapeHTML(input) {
	return input
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;")
	.replace(/\//g, "&#x2F;")
	.replace(/`/g, "&#x60;");
}