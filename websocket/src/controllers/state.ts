import uid from 'uid';
import _ from 'lodash';
const EventEmitter = require('events');
export interface UserState {
  type: string;
  socketId: string;
  name: string;
  timelag: number;
  game: GameState;
}

interface GameState {
  ready: boolean;
  room: string;
}

interface Room {
  roomId: string;
  user: UserState[];
  time: string;
  win: string;
  timeoutID: NodeJS.Timeout;
  touchTime: number;
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
    //待機中のプレイヤーを部屋に突っ込む。
    setInterval(() => {
      const waitUser = this.users.filter(
        (user: UserState) => user.type === 'waiting'
      );
      waitUser.length > 1 && this.pareCreate(waitUser);
    }, 1000);

    //準備が完了したルームからゲームを開始する。
    setInterval(() => {
      for (const room of Object.keys(this.rooms)) {
        if (this.rooms[room].user.every((user: UserState) => user.game.ready)) {
          const time = Date.now() + Math.floor(Math.random() * 3000) + 2000;
          this.startGame(this.rooms[room], time);
          this.rooms[room] = Object.assign(
            {},
            {
              roomId: this.rooms[room].roomId,
              user: this.rooms[room].user,
            }
          );
          this.rooms[room].time = time;
          this.rooms[room].user.forEach(
            (user: UserState) => (user.game.ready = false)
          );
        }
      }
    }, 1000);
  }

  startGame(room: Room, time: number) {
    this.io.to(room.roomId).emit('startGame', time);
  }

  pareCreate(waitUser: UserState[]) {
    const length = waitUser.length;
    this._option.push(waitUser.shift());
    if (length > 0) {
      this._option.length === 2
        ? this.emitEvent(waitUser)
        : this.pareCreate(waitUser);
    }
  }

  emitEvent(waitUser: UserState[]) {
    let createId = uid() + Date.now();
    this._option.forEach((user: UserState) => {
      this.update(user.socketId, 'playing');
      user.game.room = createId;
    });
    this.rooms[createId] = { user: this._option, roomId: createId };
    this.onMatching(this._option);
    this._option = [];
    if (waitUser.length > 0) {
      this.pareCreate(waitUser);
    }
  }

  createRoom(MySocketId: string, PareSocketId: string) {
    let createId = uid() + Date.now();
    const myData = this.users.find(
      (user: UserState) => user.socketId === MySocketId
    );
    const pareData = this.users.find(
      (user: UserState) => user.socketId === PareSocketId
    );

    myData.room = createId;
    pareData.room = createId;
    this.rooms[createId] = { user: [myData, pareData], roomId: createId };
    this.onMatching([myData, pareData]);
    console.log(this.rooms);
    [myData, pareData].forEach((user: UserState) => {
      this.io.to(user.socketId).emit('callUser', createId);
    });
  }
  onMatching(pareUser: UserState[]) {
    pareUser.forEach((user: UserState) => {
      this.io.to(user.socketId).emit('matchUser', pareUser);
    });
  }

  removeMatchingListener() {
    this.removeListener('match', () => { });
  }

  add(name: string, socketId: string, type: string, time: number) {
    const lag = Date.now() - time
    console.log(lag, time)
    const send = {
      name,
      socketId,
      type,
      timelag: lag,
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
    this.users.forEach((user: UserState) => {
      if (user.socketId === socketId) {
        user.type = type
        this.onUpdate([user]);
      }
    })
    return [this.users];
  }

  onUpdate(Users: UserState[]) {
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

  timeFire(socketId: string, roomId: string, time: number) {
    const room: Room = this.rooms[roomId];
    const drowTime = Math.abs(room.touchTime - time) < 10;
    console.log(roomId, room.touchTime);
    if (_.isEmpty(room.touchTime) || _.isNull(room.touchTime)) {
      clearInterval(room.timeoutID);
      room.win = socketId;
      if (_.isNumber(room.touchTime) && drowTime) {
        room.win = 'drow';
      }
      if (!(_.isNumber(room.touchTime) && drowTime)) {
        room.touchTime = time;
        room.timeoutID = setTimeout(() => {
          this.io.to(roomId).emit('finishGame', {
            socketId: room.win,
            time: room.touchTime,
          });
        }, 100);
      }
    }
  }
}
