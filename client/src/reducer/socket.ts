import {
  connect,
  disConnect,
  AddonlineUser,
  NowonlineUser,
  updateUser,
} from '../actions/socket';
import _ from 'lodash';
// tslint:disable-next-line:no-var-requires
const equal = (pre: any, cu: any, obj?: string) => {
  if (obj) {
    return pre[obj] === cu[obj];
  }
  return pre === cu;
};
const equalId = _.partial(equal, _, _, 'socketId');

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
      return {
        ...state,
        onlineUsers: [...state.onlineUsers, ...action.payload],
      };

    case NowonlineUser:
      return { ...state, onlineUsers: action.payload };

    case updateUser:
      const updateUsers = state.onlineUsers.map((oldUser) => {
        return action.payload.find((user) => equalId(oldUser, user)) || oldUser;
      });
      return { ...state, onlineUsers: updateUsers };

    default:
      return state;
  }
};
