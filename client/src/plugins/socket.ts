import {
  connect,
  AddonlineUser,
  NowonlineUser,
  matchUser,
  updateUser,
} from '../actions/socket';
const Ws = require('@adonisjs/websocket-client');
const ws = Ws('ws://localhost:3333').connect();
export const wsUser = ws.subscribe('user');
export const WrapwsUser = (dispatch: any) => {
  wsUser.on(AddonlineUser, (req: any) => {
    console.log(req);
    dispatch({ type: AddonlineUser, payload: req });
  });

  wsUser.on(NowonlineUser, (req: any) => {
    dispatch({ type: connect });
    dispatch({ type: NowonlineUser, payload: req });
  });
  wsUser.on(matchUser, (req: any) => {
    console.log(req);
  });
  wsUser.on(updateUser, (req: any) => {
    dispatch({ type: updateUser, payload: req });
  });
};
