import {
  gameStart,
  gameFinish,
  gameStateChange,
  toHomeSetPure,
  rematch,
} from '../actions';
import {
  matchUser,
  removePare,
  setRoom,
  startGame,
  finishGame,
  requestMatch,
  requestCancel,
  requestRecieve,
  timeLagSet
} from '../actions/socket';
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
  userState: 'nomal' | 'waiting' | 'playing';
  pareState: PareState[];
  room: string;
  time: number;
  fire: boolean;
  lag: number
  winner: string;
  winnerTime: number;
  SocketState?: mySocketState;
  requestUser: {};
  isMatch?: boolean;
}
const gameInitial = {
  fire: false,
  winner: '',
  winnerTime: 0,
  time: 0,
};
const initialState: GameStateType = {
  loggedIn: false,
  userState: 'nomal',
  pareState: [],
  room: '',
  lag: 0,
  requestUser: {},
  ...gameInitial,
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
      console.log(action.payload);
      return { ...state, userState: action.payload };
    case matchUser:
      return { ...state, pareState: action.payload };
    case removePare:
      const bool = state.pareState.some((user) => {
        return action.payload.every((updateUser: PareState) => {
          return user.socketId === updateUser.socketId;
        });
      });
      if (bool) {
        return { ...state, pareState: [], userState: 'nomal' };
      } else {
        return { ...state };
      }
    case finishGame:
      return {
        ...state,
        winner: action.payload.socketId,
        winnerTime: action.payload.time,
      };
    case requestRecieve:
      return {
        ...state,
        isMatch: action.payload,
      };
    case requestMatch:
      return {
        ...state,
        requestUser: action.payload,
      };
    case requestCancel:
      return {
        ...state,
        requestUser: {},
      };
    case 'Fire':
      return { ...state, fire: true };
    case toHomeSetPure:
      console.log(state.userState);
      return { ...initialState, loggedIn: true, lag: state.lag, requestUser: state.requestUser };
    case setRoom:
      return { ...state, room: action.payload };
    case rematch:
      return { ...state, ...gameInitial };
    case startGame:
      return { ...state, userState: 'playing', time: action.payload };
    case timeLagSet:
      return { ...state, lag: action.payload }
    default:
      return state;
  }
};
