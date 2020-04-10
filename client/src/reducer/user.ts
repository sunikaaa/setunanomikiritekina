import { setUserName } from '../actions';
export interface UserActionType {
  type: string;
  paylord: string;
}

export interface UserStateType {
  name: string;
}
const initlalState: UserStateType = {
  name: '',
};

export const UserReducer = (
  state = initlalState,
  action: UserActionType
): any => {
  switch (action.type) {
    case setUserName:
      return { name: action.paylord };
    default:
      return state;
  }
};
