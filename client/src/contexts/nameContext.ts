import { createContext } from 'react';
import { GameStateType } from '../reducer/game';
import { SoskcetStateType } from '../reducer/socket';
import { UserStateType } from '../reducer/user';

export interface ContextState {
  state: State;
  dispatch: any;
}

export interface State {
  game: GameStateType;
  user: UserStateType;
  socket: SoskcetStateType;
}

export const NameInitialState: State = {
  game: {
    loggedIn: false,
    userState: 'nomal',
    pareState: [],
    room: '',
    time: 0,
    fire: false,
    winner: '',
    winnerTime: 0,
    requestUser: {},
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
