import uid from 'uid';
import _ from 'lodash';
import { EventEmitter } from 'events';
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
  time?: number;
  win?: string;
  timeoutID?: NodeJS.Timeout;
  touchTime?: number;
}



const myEvent = new EventEmitter();
export class User extends EventEmitter {
  users: UserState[];
  private _option: UserState[];
  io: any;
  rooms: Map<string, Room>;
  constructor(
    io: SocketIO.Server,
    user: UserState[] = [],
    option: UserState[] = []
  ) {
    super();
    this.users = user;
    this._option = option;
    this.io = io;
    this.rooms = new Map();
  }

  startInterval() {
    //待機中のプレイヤーを部屋に突っ込む。
    setInterval(() => {
      const waitUser = this.users.filter(
        (user: UserState) => user.type === 'waiting'
      );
      if (!_.isEmpty(waitUser)) console.log(waitUser);
      waitUser.length > 1 && this.pareCreate(waitUser);
    }, 1000);

    //準備が完了したルームからゲームを開始する。
    setInterval(() => {

      this.rooms.forEach(room => {
        if (room.user.every(user => user.game.ready)) {
          const time = Date.now() + Math.floor(Math.random() * 3000) + 2000;
          this.startGame(room, time);
          room = this.initializeRoom(room);
          room.time = time;
        }
      })
    }, 1000);
  }

  startGame(room: Room, time: number) {
    this.emit("startGame", { to: room.roomId, emit: { time, room: room.roomId } });
    this.io.to(room.roomId).emit('startGame', { time, room: room.roomId });
  }

  initializeRoom(room: Room) {
    room.timeoutID = undefined;
    room.win = undefined;
    room.touchTime = undefined;
    room.user.forEach(user => user.game.ready = false);
    return room;
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
    const room: Room = {
      user: this._option,
      roomId: createId,
    }
    this.rooms.set(createId, room)
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
    if (_.isUndefined(myData) || _.isUndefined(myData)) {
      return;
    }
    myData.game.room = createId;
    pareData.game.room = createId;
    const room: Room = {
      user: [myData, pareData],
      roomId: createId
    }
    this.rooms.set(createId, room);
    this.onMatching([myData, pareData]);
    [myData, pareData].forEach((user: UserState) => {
      this.emit("callUser", { user, createId });
      this.io.to(user.socketId).emit('callUser', createId);
    });
  }



  onMatching(pareUser: UserState[]) {
    pareUser.forEach((user: UserState) => {
      this.emit("matchUser", { user, pareUser });
      this.io.to(user.socketId).emit('matchUser', pareUser);
    });
  }

  removeMatchingListener() {
    this.removeListener('match', () => { });
  }

  add(name: string, socketId: string, type: string, time: number) {
    const lag = Date.now() - time;
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
        user.type = type;
        this.onUpdate([user]);
      }
    });
    return [this.users];
  }

  onUpdate(Users: UserState[]) {
    this.emit("updateUser", Users);
    this.io.emit('updateUser', Users);
  }

  readyGame(socketId: string, roomId: string) {
    const room: Room = this.rooms.get(roomId);
    room.user.forEach((user: UserState) => {
      if (user.socketId === socketId) {
        user.game.ready = true;
      }
      this.emit("ready", user, socketId);
      this.io.to(user.socketId).emit('ready', socketId);
    });
  }

  timeFire(socketId: string, roomId: string, time: number) {
    const room = this.rooms.get(roomId);
    if (_.isUndefined(room)) return;

    const touchTime = time - room.time;

    let drowTime = Math.abs(room.touchTime - touchTime) < 20;


    if (room.touchTime === -room.time) {
      room.touchTime = time;
      room.win = socketId;
    }

    if (time === 0) {
      room.touchTime = touchTime;
    }
    if (_.isUndefined(room.touchTime)) {
      room.touchTime = touchTime;
      room.win = socketId;
    }


    if (_.isNumber(room.touchTime) && room.touchTime - touchTime > 0) {
      clearInterval(room.timeoutID);
      room.win = socketId;
      room.touchTime = touchTime;
    }

    if (_.isNumber(room.touchTime) && drowTime) {
      room.win = 'drow';
      this.io.to(roomId).emit('finishGame', {
        socketId: room.win,
        time: room.touchTime,
      });
    } else if (time !== 0) {
      room.timeoutID = setTimeout(() => {
        this.io.to(roomId).emit('finishGame', {
          socketId: room.win,
          time: room.touchTime,
        });
      }, 100);
    }
  }
}
