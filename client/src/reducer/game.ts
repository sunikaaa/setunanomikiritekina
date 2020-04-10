import { gameStart, gameFinish } from '../actions';

export interface GameActionType {
  type: string;
  payload: string;
}

export interface GameStateType {
  isGame: boolean;
}
const initialState: GameStateType = {
  isGame: false,
};
export const GameReducer = (
  state = initialState,
  action: GameActionType
): any => {
  switch (action.type) {
    case gameStart:
      return { ...state, isGame: true };
    case gameFinish:
      return { isGame: false };
    default:
      return state;
  }
};
