const EventEmitter = require("events");

class User extends EventEmitter {
  constructor() {
    super();
    this.users = [];
    this._option = [];
  }

  startInterval() {
    setInterval(() => {
      const waitUser = this.users.filter((user) => user.type === "waiting");
      console.log(waitUser);
      waitUser.length > 1 ? this.pareCreate(waitUser) : "";
    }, 2000);
  }

  pareCreate(waitUser) {
    const length = waitUser.length;
    let random = Math.floor(Math.random() * length) - 1;
    this._option.push(waitUser.splice(random, 1));
    if (length - 1 > 1) {
      this._option.length % 2 === 0
        ? this.emitEvent()
        : this.pareCreate(waitUser);
    }
  }

  emitEvent() {
    this._option.forEach((user) => {
      user = this.update(user.socketId, "playing");
    });
    this.emit("match", this._option);
  }
  onMatching(fn) {
    this.on("match", (pareUser) => {
      fn(pareUser);
    });
  }

  removeMatchingListener() {
    this.removeListener("match");
  }

  add(name, socketId, type) {
    const send = {
      name,
      socketId,
      type,
    };
    this.users.push(send);
    return [send];
  }
  remove(socketId) {
    this.users = this.users.filter((user) => user.socketId !== socketId);
    return this.users;
  }
  update(socketId, type) {
    const userIndex = this.users.findIndex(
      (user) => socketId === user.socketId
    );
    let user = this.users[userIndex];
    user.type = type;
    this.users.splice(userIndex, 1, user);
    return [user];
  }
}

let user = new User();
user.startInterval();
module.exports = user;
