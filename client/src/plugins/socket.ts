import {
  connectUser,
  AddonlineUser,
  NowonlineUser,
  matchUser,
  updateUser,
  removePare,
  removeUser,
  disConnect,
  setRoom,
  startGame,
} from '../actions/socket';
import Ws from 'socket.io-client';
import { ContextState } from '../contexts/nameContext';
export const wsUser = Ws('http://localhost:5000');
interface onlineUser {
  name: string;
  socketId: string;
  type: string;
}
interface mySocketState extends onlineUser {
  game: {
    room: string;
    ready: false;
  };
}

interface PareState {
  name: string;
  socketId: string;
}
export const wsToHome = (user: PareState[]) => {
  wsUser.emit('toHome', user);
};

export const WrapwsUser = ({ state, dispatch }: ContextState) => {
  let socketId: string = '';
  wsUser.on(connectUser, (req: any) => {
    dispatch({ type: connectUser, payload: req });
    console.log(req);
    socketId = req;
  });

  wsUser.on(removePare, (req: any) => {
    dispatch({ type: removePare, payload: req });
  });

  wsUser.on(AddonlineUser, (req: any) => {
    dispatch({ type: AddonlineUser, payload: req });
  });

  wsUser.on(NowonlineUser, (req: any) => {
    dispatch({ type: NowonlineUser, payload: req });
  });

  wsUser.on(matchUser, (req: mySocketState[]) => {
    const pare = req.filter(
      (user: onlineUser) => user.socketId.toString() !== socketId
    );
    console.log(pare, socketId);
    dispatch({ type: matchUser, payload: pare });
    dispatch({ type: setRoom, payload: pare[0].game.room });
  });

  wsUser.on(updateUser, (req: onlineUser[]) => {
    dispatch({ type: updateUser, payload: req });
    const removeUser = req.filter((user: onlineUser) => {
      return user.type === 'nomal';
    });
    console.log(req);
    dispatch({ type: removePare, payload: removeUser });
  });
  wsUser.on(disConnect, (socketId: string) => {
    console.log('disConnect', socketId);
    dispatch({ type: removePare, payload: [{ socketId: socketId }] });
    dispatch({ type: removeUser, payload: { socketId: socketId } });
  });

  // Game move
  wsUser.on(startGame, (time: number) => {
    dispatch({
      type: startGame,
      payload: time,
    });
  });
};
