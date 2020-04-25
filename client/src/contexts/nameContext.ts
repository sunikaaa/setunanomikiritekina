import { createContext } from 'react';
import { GameStateType } from '../reducer/game';
import { SoskcetStateType } from '../reducer/socket';
import { UserStateType } from '../reducer/user';
interface ContextState {
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
    gameState: 'home',
    pareState: [],
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
