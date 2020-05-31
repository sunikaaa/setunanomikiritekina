import { User, UserState } from './state';
const waiting: string = 'waiting';
const nomal: string = 'nomal';

const socketFunc = (
  socket: SocketIO.Socket,
  io: SocketIO.Server,
  UserState: User
) => {
  socket.emit('connectUser', socket.id);
  console.log(socket.id)
  socket.on('setname', ({ name, nowTime }) => {
    const user: UserState[] = UserState.add(name, socket.id, nomal, nowTime);
    socket.emit('NowonlineUser', UserState.users);
    socket.broadcast.emit('AddonlineUser', user);
  });

  socket.on('toHome', () => {
    UserState.update(socket.id, nomal);
  });

  socket.on('setlag', () => {
    UserState.setLag(socket.id);
  })

  socket.on('serchPare', () => {
    UserState.update(socket.id, waiting);
  });

  socket.on('disconnect', () => {
    UserState.remove(socket.id);
    socket.broadcast.emit('disConnect', socket.id);
  });

  socket.on("setTime", (time: number) => {
    socket.emit("timeLagSet", Date.now() - time);
  })

  socket.on('requestMatch', ({ socketId, user }) => {
    socket.to(socketId).emit('requestMatch', user);
  });

  socket.on('quitRequest', ({ socketId }) => {
    socket.to(socketId).emit('requestQuit');
  });

  socket.on('createRoom', ({ socketId }) => {
    UserState.createRoom(socket.id, socketId);
  });

  socket.on('gameFire', ({ roomId, time }) => {
    UserState.timeFire(socket.id, roomId, time);
  });

  socket.on('readyGO', ({ roomId }) => {
    socket.join(roomId, () => {
      UserState.readyGame(socket.id, roomId);
    });
  });
};

export default socketFunc;
