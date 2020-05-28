import { setUserName } from '../actions';
import { connectUser } from '../actions/socket';
export interface UserActionType {
  type: string;
  payload: string;
}

export interface UserStateType {
  name: string;
  socketId: string;
}
const initlalState: UserStateType = {
  name: '',
  socketId: '',
};

export const UserReducer = (
  state = initlalState,
  action: UserActionType
): any => {
  switch (action.type) {
    case setUserName:
      return { ...state, name: action.payload };
    case connectUser:
      return { ...state, socketId: action.payload };
    default:
      return state;
  }
};
