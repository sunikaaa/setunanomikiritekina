import { gameStart, gameFinish } from '../actions';

export interface GameActionType {
  type: string;
  payload: string;
}

export interface GameStateType {
  loggedIn: boolean;
  isGame: boolean;
}
const initialState: GameStateType = {
  loggedIn: false,
  isGame: false,
};
export const GameReducer = (
  state = initialState,
  action: GameActionType
): any => {
  switch (action.type) {
    case gameStart:
      return { ...state, loggedIn: true };
    case gameFinish:
      return { loggedIn: false };
    default:
      return state;
  }
};
