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
	console.log(`Escuchando en el puerto ${PUERTO}`);
})

// Generamos la instancia de Socket.io del lado del backend
const io = new Server(httpServer);

// Vamos a crear un array para almacenar todos los usuarios con sus mensajes;

let messages = [];

io.on("connection", (socket) => {
	console.log("Nuevo usuario conectado");

	socket.on("message", data => {
		if(data.message == "__chatreset__") {
			messages = [];
		} else {
			messages.push({
				user: data.user,
				message: escapeHTML(data.message),
				date: Date.now()
			});
		}

		// Aca envio el array actualizado:
		io.emit("messagesLogs", messages);
	})

	socket.on("logIn", data => {
		// Si se logueo un usuario, le envio el chat para que lo cargue
		io.emit("messagesLogs", messages);
	})
})

// Función para escapar el contenido del mensaje

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