import {
  connect,
  AddonlineUser,
  NowonlineUser,
  matchUser,
  updateUser,
  removePare,
} from '../actions/socket';
const Ws = require('@adonisjs/websocket-client');
const ws = Ws('ws://localhost:3333').connect();
let socketId: string = '';
interface onlineUser {
  name: string;
  socketId: string;
  type: string;
}
interface PareState {
  name: string;
  socketId: string;
}
export const wsUser = ws.subscribe('user');
export const wsToHome = (user: PareState[]) => {
  wsUser.emit('toHome', user);
};

export const WrapwsUser = (dispatch: any) => {
  wsUser.on(connect, (req: any) => {
    socketId = req;
    dispatch({ type: connect, payload: req });
  });

  wsUser.on(removePare, (req: any) => {
    dispatch({ type: removePare, payload: req });
  });

  wsUser.on(AddonlineUser, (req: any) => {
    dispatch({ type: AddonlineUser, payload: req });
  });

  wsUser.on(NowonlineUser, (req: any) => {
    dispatch({ type: connect });
    dispatch({ type: NowonlineUser, payload: req });
  });

  wsUser.on(matchUser, (req: any) => {
    console.log(req);
    const pare = req.filter((user: onlineUser) => user.socketId !== socketId);
    dispatch({ type: matchUser, payload: pare });
  });

  wsUser.on(updateUser, (req: any) => {
    dispatch({ type: updateUser, payload: req });
  });
};
