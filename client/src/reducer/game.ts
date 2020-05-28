import {
  gameStart,
  gameFinish,
  gameStateChange,
  toHomeSetPure,
} from '../actions';
import { matchUser, removePare, setRoom, startGame } from '../actions/socket';
export interface GameActionType {
  type: string;
  payload: any;
}
export interface onlineUser {
  name: string;
  socketId: string;
  type: string;
}

export interface mySocketState extends onlineUser {
  game: {
    room: string;
    ready: false;
  };
}

interface PareState {
  name: string;
  socketId: string;
}

export interface GameStateType {
  loggedIn: boolean;
  userState: string;
  pareState: PareState[];
  room: string;
  time: number;
  fire: boolean;
  SocketState?: mySocketState;
}
const initialState: GameStateType = {
  loggedIn: false,
  userState: 'home',
  pareState: [],
  room: '',
  fire: false,
  time: 10000000000000,
};
export const GameReducer = (
  state = initialState,
  action: GameActionType
): any => {
  switch (action.type) {
    case gameStart:
      return { ...state, loggedIn: true };
    case gameFinish:
      return { ...state, loggedIn: false };
    case gameStateChange:
      return { ...state, userState: action.payload };
    case matchUser:
      return { ...state, pareState: action.payload };
    case removePare:
      const pare = state.pareState.filter((user) => {
        return action.payload.every(
          (removeUser: PareState) => user.socketId !== removeUser.socketId
        );
      });
      console.log(pare);
      return { ...state, pareState: pare };
    case 'Fire':
      return { ...state, fire: true };
    case toHomeSetPure:
      return { ...initialState, loggedIn: true };
    case setRoom:
      return { ...state, room: action.payload };
    case startGame:
      return { ...state, userState: 'playing', time: action.payload };
    default:
      return state;
  }
};
