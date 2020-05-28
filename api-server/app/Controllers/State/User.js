const EventEmitter = require("events");
const Ws = use("Ws");

class User extends EventEmitter {
  constructor() {
    super();
    this.users = [];
    this._option = [];
  }

  startInterval() {
    setInterval(() => {
      const waitUser = this.users.filter((user) => user.type === "waiting");
      waitUser.length > 1 && this.pareCreate(waitUser);
    }, 5000);
  }

  pareCreate(waitUser) {
    const length = waitUser.length;
    this._option.push(waitUser.shift());
    if (length > 0) {
      console.log(this._option.length, waitUser, "this is option");
      this._option.length === 2
        ? this.emitEvent(waitUser)
        : this.pareCreate(waitUser);
    }
  }

  emitEvent(waitUser) {
    console.log(waitUser, "emitEvent");
    this._option.forEach((user) => {
      user = this.update(user.socketId, "playing");
    });
    this.emit("match", this._option);
    console.log("option set");
    this._option = [];
    if (waitUser.length > 0) {
      this.pareCreate(waitUser);
    }
  }
  onMatching(fn) {
    this.on("match", (pareUser) => {
      fn(pareUser);
    });
  }

  removeMatchingListener() {
    this.removeListener("match", () => {});
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

  async remove(socketId) {
    this.users = await this.users.filter((user) => user.socketId !== socketId);
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
