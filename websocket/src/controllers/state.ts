import uid from 'uid';
const EventEmitter = require('events');
export interface UserState {
  type: string;
  socketId: string;
  name: string;
  game: GameState;
}

interface GameState {
  ready: boolean;
  room: string;
}

interface Room {
  roomId: string;
  time: string;
  user: UserState[];
}
export class User extends EventEmitter {
  constructor(
    io: SocketIO.Server,
    user: UserState[] = [],
    option: UserState[] = [],
    rooms = {}
  ) {
    super();
    this.users = user;
    this._option = option;
    this.io = io;
    this.rooms = rooms;
  }

  startInterval() {
    setInterval(() => {
      const waitUser = this.users.filter(
        (user: UserState) => user.type === 'waiting'
      );
      waitUser.length > 1 && this.pareCreate(waitUser);
    }, 5000);

    setInterval(() => {
      for (const room of Object.keys(this.rooms)) {
        if (this.rooms[room].user.every((user: UserState) => user.game.ready)) {
          const time = Date.now() + Math.floor(Math.random() * 3000) + 2000;
          this.startGame(this.rooms[room], time);
          this.rooms[room].time = time;
        }
      }
    }, 5000);
  }

  startGame(room: Room, time: number) {
    console.log(room);
    this.io.to(room.roomId).emit('startGame', time);
  }

  pareCreate(waitUser: UserState[]) {
    const length = waitUser.length;
    this._option.push(waitUser.shift());
    if (length > 0) {
      console.log(this._option.length, waitUser, 'this is option');
      this._option.length === 2
        ? this.emitEvent(waitUser)
        : this.pareCreate(waitUser);
    }
  }

  emitEvent(waitUser: UserState[]) {
    console.log(waitUser, 'emitEvent');
    let createId = uid() + Date.now();
    this._option.forEach((user: UserState) => {
      this.update(user.socketId, 'playing');
      user.game.room = createId;
    });
    this.rooms[createId] = { user: this._option, roomId: createId };
    this.onMatching(this._option);
    console.log(this.rooms);
    this._option = [];
    if (waitUser.length > 0) {
      this.pareCreate(waitUser);
    }
  }
  onMatching(pareUser: UserState[]) {
    console.log(this.rooms);
    pareUser.forEach((user: UserState) => {
      this.io.to(user.socketId).emit('matchUser', pareUser);
    });
  }

  removeMatchingListener() {
    this.removeListener('match', () => {});
  }

  add(name: string, socketId: string, type: string) {
    const send = {
      name,
      socketId,
      type,
      game: {
        ready: false,
        room: '',
      },
    };
    this.users.push(send);
    return [send];
  }

  async remove(socketId: string) {
    this.users = await this.users.filter(
      (user: UserState) => user.socketId !== socketId
    );
    return this.users;
  }

  update(socketId: string, type: string) {
    const userIndex = this.users.findIndex(
      (user: UserState) => socketId === user.socketId
    );
    let user = this.users[userIndex];
    user.type = type;
    this.users.splice(userIndex, 1, user);
    this.onUpdate([user]);
    return [user];
  }

  onUpdate(Users: UserState[]) {
    console.log(Users);
    this.io.emit('updateUser', Users);
  }

  readyGame(socketId: string, roomId: string) {
    const room: Room = this.rooms[roomId];
    room.user.forEach((user: UserState) => {
      if (user.socketId === socketId) {
        user.game.ready = true;
      }
    });
  }
}
