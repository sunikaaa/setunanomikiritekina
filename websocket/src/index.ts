import express from 'express';
import { User } from './controllers/state';
import Server from 'socket.io';
import _ from 'lodash';
import socketFanc from './controllers/socketController';
var app = express();

const server: any = require('http').createServer(app);
const PORT = process.env.PORT || 5000;
const io = Server(server);

const UserState = new User(io);
UserState.startInterval();

const socketFn = _.partial(socketFanc, _, io, UserState);
io.on('connection', socketFn);
server.listen(PORT, () => {
  console.log('http://0.0.0.0' + ':5000');
});

app.get('/', (req, res) => {
  res.send('hello');
});
