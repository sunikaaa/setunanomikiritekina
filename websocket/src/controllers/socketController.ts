import { User, UserState } from './state';
const waiting: string = 'waiting';
const nomal: string = 'nomal';

const socketFunc = (
  socket: SocketIO.Socket,
  io: SocketIO.Server,
  UserState: User
) => {
  console.log('connect', socket.id);
  socket.emit('connectUser', socket.id);

  socket.on('setname', (name: string) => {
    const user: UserState[] = UserState.add(name, socket.id, nomal);
    socket.emit('NowonlineUser', UserState.users);
    socket.broadcast.emit('AddonlineUser', user);
  });

  socket.on('toHome', () => {
    UserState.update(socket.id, nomal);
  });

  socket.on('serchPare', () => {
    UserState.update(socket.id, waiting);
  });

  socket.on('disconnect', () => {
    UserState.remove(socket.id);
    socket.broadcast.emit('disConnect', socket.id);
  });

  socket.on('readyGO', (roomId) => {
    socket.join(roomId, () => {
      UserState.readyGame(socket.id, roomId);
    });
  });
};

export default socketFunc;
