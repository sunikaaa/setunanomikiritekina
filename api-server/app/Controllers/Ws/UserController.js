"use strict";
const userState = require("../State/User");
const waiting = "waiting";
const nomal = "nomal";
console.log(userState, "this is State");
class UserController {
  constructor({ socket, request }) {
    this.socket = socket;
    this.request = request;

    this.socket.emit("connect", this.socket.id);
  }

  onSetname(name) {
    console.log(name, "this log");
    const user = userState.add(name, this.socket.id, nomal);
    this.socket.emit("NowonlineUser", userState.users);
    this.socket.broadcast("AddonlineUser", user);
  }

  onToHome(gameUsers) {
    const user = userState.update(this.socket.id, "nomal");
    this.updateEmit(user);
    gameUsers.forEach((gameUser) => {
      this.socket.emitTo("updatePareState", user, gameUser.socketId);
    });
  }

  onClose() {
    const newState = userState.remove(this.socket.id);
    console.log(newState, "this is new State");
    this.updateEmit(newState);
  }
  //@pareUser :{}
  //
  onSerchPare() {
    const newState = userState.update(this.socket.id, waiting);
    this.updateEmit(newState);
    userState.onMatching((pareUser) => {
      console.log(pareUser, "emitUser");
      try {
        this.updateEmit(pareUser);
        this.socket.emitTo(
          "matchUser",
          pareUser,
          pareUser.map((user) => user.socketId)
        );
      } catch (error) {
        console.log(error);
      }
    });
  }
  updateEmit(state) {
    this.socket.broadcastToAll("updateUser", state);
  }
  onError() {
    console.log("this is err");
  }
}

module.exports = UserController;
