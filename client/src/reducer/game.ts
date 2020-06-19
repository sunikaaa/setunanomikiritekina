import {
  gameStart,
  gameFinish,
  gameStateChange,
  toHomeSetPure,
  rematch,
  aloneStart,
  YOULOSE,
  levelUP
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
  timeLagSet,
  ready,
} from '../actions/socket';
import _ from 'lodash'
import { wsUser } from '../plugins/socket';
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
    ready: boolean;
  };
}

interface PareState {
  name: string;
  socketId: string;
  game: {
    room: string;
    ready: boolean;
  };
}

export interface GameStateType {
  loggedIn: boolean;
  userState: 'nomal' | 'waiting' | 'playing';
  pareState: PareState[];
  room: string;
  time: number;
  fire: boolean;
  lag: number;
  winner: string;
  winnerTime: number;
  SocketState?: mySocketState;
  requestUser: {};
  isMatch?: boolean;
  isAlone: boolean;
  aloneCount: number;
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
  isAlone: false,
  room: '',
  lag: 0,
  requestUser: {},
  aloneCount: 0,
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
      console.log(action.payload.socketId)
      return {
        ...state,
        winner: action.payload.socketId,
        winnerTime: action.payload.time,
      };
    case aloneStart:
      return {
        ...state,
        isAlone: true
      }
    case requestRecieve:
      return {
        ...state,
        isMatch: action.payload,
      };
    case requestMatch:
      if (_.isEmpty(state.requestUser)) {
        return {
          ...state,
          requestUser: action.payload,
        };
      } else {
        wsUser.emit("quitRequest", { socketId: action.payload.socketId });
        return {
          ...state
        }
      }
    case requestCancel:
      return {
        ...state,
        requestUser: {},
      };
    case 'Fire':
      return { ...state, fire: true };
    case toHomeSetPure:
      console.log(state.userState);
      return {
        ...initialState,
        loggedIn: true,
        lag: state.lag,
      };
    case setRoom:
      return { ...state, room: action.payload };
    case rematch:
      return { ...state, ...gameInitial };
    case levelUP:
      return { ...state, aloneCount: state.aloneCount + 1 };
    case startGame:
      return { ...state, userState: 'playing', time: action.payload };
    case timeLagSet:
      return { ...state, lag: action.payload };
    case ready:
      state.pareState.forEach((user) => {
        if (action.payload === user.socketId) {
          user.game.ready = true;
        }
      });
      return { ...state };
    case YOULOSE:
      return { ...state, aloneCount: 0 }
    default:
      return state;
  }
};
