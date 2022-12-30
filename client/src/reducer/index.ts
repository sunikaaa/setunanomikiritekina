import { combineReducers } from 'redux';

import { UserReducer as user } from './user';
import { SocketReducer as socket } from './socket';
import { GameReducer as game } from './game';
// import { OnlineUsers as online } from './onlineUser'

export default combineReducers({
  game,
  user,
  socket,
  // online
});
