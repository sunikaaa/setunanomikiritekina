import { createContext } from 'react';
import { GameStateType } from '../reducer/game';
import { SocketStateType } from '../reducer/socket';
import { UserStateType } from '../reducer/user';
import {normal,gameWindowState} from '../actions/gamePage'

export interface ContextState {
  state: State;
  dispatch: any;
}

export interface State {
  game: GameStateType;
  user: UserStateType;
  socket: SocketStateType;
}

export const NameInitialState: State = {
  game: {
    loggedIn: false,
    userState: normal,
    pareState: [],
    room: '',
    time: 0,
    fire: false,
    winner: '',
    winnerTime: 0,
    requestUser: {},
    lag: 0
  },
  user: {
    name: '',
    socketId: '',
  },
  socket: {
    isConnected: false,
    onlineUsers: [],
  },
};

export const NameContext = createContext({
  state: { ...NameInitialState },
  dispatch({ ...object }: any) {
    return;
  },
});

// export { NameContext };
