import { gameStart, gameFinish, gameStateChange } from '../actions';
import { matchUser, removePare } from '../actions/socket';
export interface GameActionType {
  type: string;
  payload: any;
}

interface PareState {
  name: string;
  socketId: string;
}

export interface GameStateType {
  loggedIn: boolean;
  gameState: string;
  pareState: PareState[];
}
const initialState: GameStateType = {
  loggedIn: false,
  gameState: 'home',
  pareState: [],
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
      return { ...state, gameState: action.payload };
    case matchUser:
      return { ...state, pareState: action.payload };
    case removePare:
      const pare = state.pareState.filter((user) => {
        return action.payload.every(
          (removeUser: PareState) => user.socketId !== removeUser.socketId
        );
      });
      return { ...state, pareState: pare };
    default:
      return state;
  }
};
