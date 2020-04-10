import {
  connect,
  disConnect,
  AddonlineUser,
  NowonlineUser,
  updateUser,
  matchUser,
} from '../actions/socket';
import _ from 'lodash';
// tslint:disable-next-line:no-var-requires
const equal = (pre: any, cu: any, obj?: string) => {
  if (obj) {
    return pre[obj] === cu[obj];
  }
  return pre === cu;
};
const equalId = _.curryRight(equal)('socketId');

export interface ScoketActionType {
  type: string;
  payload: onlineUser[];
}

export interface SoskcetStateType {
  isConnected: boolean;
  onlineUsers: onlineUser[];
}

export interface onlineUser {
  name: string;
  socketId: string;
  type: string;
}
const initialState: SoskcetStateType = {
  isConnected: false,
  onlineUsers: [],
};

export const SocketReducer = (
  state = initialState,
  action: ScoketActionType
): any => {
  switch (action.type) {
    case connect:
      return { ...state, isConnected: true };

    case disConnect:
      return { ...state, isConnected: false };

    case AddonlineUser:
      console.log(state);
      return {
        ...state,
        onlineUsers: [...state.onlineUsers, ...action.payload],
      };

    case NowonlineUser:
      console.log(state, action.payload);
      return { ...state, onlineUsers: action.payload };

    case updateUser:
      console.log(action.payload);
      const updateUsers = state.onlineUsers.map((oldUser) => {
        return action.payload.some(equalId(oldUser))
          ? action.payload.find(equalId(oldUser))
          : oldUser;
      });
      return { ...state, onlineUsers: updateUsers };

    case matchUser:
    default:
      return state;
  }
};
