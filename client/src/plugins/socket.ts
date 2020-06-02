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
  finishGame,
  requestMatch,
  requestQuit,
  callUser,
  timeLagSet,
} from '../actions/socket';
import Ws from 'socket.io-client';
import { ContextState } from '../contexts/nameContext';
import _ from 'lodash';

export const wsUser = Ws('ws://133.130.101.109:3030');

interface onlineUser {
  name: string;
  socketId: string;
  type: string;
  lag: number;
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
    socketId = req;
    console.log(socketId);
  });

  wsUser.on(removePare, (req: any) => {
    dispatch({ type: removePare, payload: req });
  });

  wsUser.on(AddonlineUser, (req: any) => {
    const notMe = req.filter((user: onlineUser) => user.socketId !== socketId);
    dispatch({ type: AddonlineUser, payload: notMe });
  });

  wsUser.on(NowonlineUser, (req: any) => {
    const notMe = req.filter((user: onlineUser) => user.socketId !== socketId);
    dispatch({ type: NowonlineUser, payload: notMe });

    const Me = req.find((user: onlineUser) => user.socketId === socketId);
    dispatch({ type: timeLagSet, payload: Me.timelag });
  });

  wsUser.on(matchUser, (req: mySocketState[]) => {
    const pare = req.filter(
      (user: onlineUser) => user.socketId.toString() !== socketId
    );
    dispatch({ type: matchUser, payload: pare });
    dispatch({ type: setRoom, payload: pare[0].game.room });
  });

  wsUser.on(requestQuit, () => {
    dispatch({ type: requestMatch, payload: {} });
  });

  wsUser.on(updateUser, (req: onlineUser[]) => {
    dispatch({ type: updateUser, payload: req });
    const removeUser = req.filter((user: onlineUser) => {
      return socketId !== user.socketId && user.type === 'nomal';
    });
    if (!_.isEmpty(removeUser))
      dispatch({ type: removePare, payload: removeUser });
  });
  wsUser.on(disConnect, (socketId: string) => {
    dispatch({ type: removePare, payload: [{ socketId: socketId }] });
    dispatch({ type: removeUser, payload: { socketId: socketId } });
  });

  // Game move
  wsUser.on(startGame, ({ time, room }: { time: number; room: string }) => {
    dispatch({
      type: startGame,
      payload: time,
    });
    dispatch({
      type: setRoom,
      payload: room,
    });
  });
  wsUser.on(finishGame, (gameWin: { socketId: string; time: number }) => {
    console.log(gameWin);
    dispatch({
      type: finishGame,
      payload: gameWin,
    });
  });
  wsUser.on(requestMatch, (user: { socketId: string; name: string }) => {
    dispatch({
      type: requestMatch,
      payload: user,
    });
  });
  wsUser.on(callUser, (roomId: string) => {
    wsUser.emit('readyGO', { roomId });
    dispatch({ type: setRoom, payload: roomId });
  });

  setInterval(() => {
    wsUser.emit('setTime', Date.now());
  }, 5000);

  wsUser.on(timeLagSet, (time: number) => {
    dispatch({ type: timeLagSet, payload: time });
  });
};
