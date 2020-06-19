import express from 'express';
import { User } from './controllers/state';
import Server from 'socket.io';
import _ from 'lodash';
import socketFanc from './controllers/socketController';
var app = express();

const server: any = require('http').createServer(app);
const PORT = process.env.PORT || 3030;
export const io = Server(server)

export const EventUser = new User(io);
EventUser.startInterval();
const socketFn = _.partial(socketFanc, _, io, EventUser);
io.on('connection', socketFn);
server.listen(PORT, () => {
  console.log('http://0.0.0.0' + ':3030');
});

