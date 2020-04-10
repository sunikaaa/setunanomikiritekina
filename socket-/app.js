var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const ip = require('ip');
// var logger = require('morgan');

var app = express();

const server = require('http').createServer(app);
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(server);
const _ = require('lodash');
const State = require('./controllers/state.js').state;
const socketFanc = require('./controllers/socket');

io.on('connection', socketFanc.socketConnect(io, State));

server.listen(PORT, () => {});
