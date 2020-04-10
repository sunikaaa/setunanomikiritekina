"use strict";

const Ws = use("Ws");
/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

Ws.channel("user", "UserController");
// Ws.channel("user", ({ socket }) => {
//   socket.on("error", () => {
//     console.log("error occer");
//   });
//   socket.emit("test", socket.id);
//   console.log("user joined with %s socket id", socket.id);
// });
