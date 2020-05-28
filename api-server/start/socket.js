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
//   console.log(socket.connection);
//   socket.on("close", () => {});
// });
