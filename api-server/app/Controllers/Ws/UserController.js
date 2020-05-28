"use strict";
const userState = require("../State/User");
const waiting = "waiting";
const nomal = "nomal";
const Ws = use("Ws");

class UserController {
  constructor({ socket, request }) {
    this.socket = socket;
    this.request = request;
    this.socket.emit("connect", this.socket.id);
  }

  onSetname(name) {
    const user = userState.add(name, this.socket.id, nomal);
    this.socket.emit("NowonlineUser", userState.users);
    this.socket.broadcast("AddonlineUser", user);
  }

  onToHome() {
    const user = userState.update(this.socket.id, "nomal");
    this.updateEmit(user);
  }

  async onClose() {
    const newState = await userState.remove(this.socket.id);
    // this.updateEmit(newState);
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
    console.log("state", state);
    this.socket.broadcastToAll("updateUser", state);
  }
  onError() {
    console.log("this is err");
  }
}

module.exports = UserController;
