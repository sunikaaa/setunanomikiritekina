import {
  connectUser,
  disConnect,
  AddonlineUser,
  NowonlineUser,
  updateUser,
  removeUser,
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
  payload: onlineUser[] | any;
}

export interface SocketStateType {
  isConnected: boolean;
  onlineUsers: onlineUser[];
  mySocketState?: mySocketState;
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
const initialState: SocketStateType = {
  isConnected: false,
  onlineUsers: [],
};

export const SocketReducer = (
  state = initialState,
  action: ScoketActionType
): any => {
  switch (action.type) {
    case connectUser:
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
        return (
          action.payload.find((user: onlineUser) => equalId(oldUser, user)) ||
          oldUser
        );
      });
      return { ...state, onlineUsers: updateUsers };
    case removeUser:
      const remove = state.onlineUsers.filter(
        (oldUser) => oldUser.socketId !== action.payload.socketId
      );
      return { ...state, onlineUsers: remove };
    default:
      return state;
  }
};
