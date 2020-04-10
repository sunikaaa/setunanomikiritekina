import { combineReducers } from 'redux';

import { UserReducer as user } from './user';
import { SocketReducer as socket } from './socket';
import { GameReducer as game } from './game';

export default combineReducers({
  game,
  user,
  socket,
});
