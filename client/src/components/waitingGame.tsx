import React, { useContext, useEffect } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/loading.scss';
import '../css/main.scss';
import '../css/waitingGame.scss';
import _ from 'lodash';
import { gameStateChange, rematch } from '../actions';
import { wsToHome, wsUser } from '../plugins/socket';
const WaitingPare = () => {
  useEffect(() => {
    wsUser.emit('serchPare');
  }, []);
  return (
    <div className='waiting-pare-container'>
      <WaitingCanvas />
      <div className='waiting-message'>
        対戦相手を待っています......
      </div>
    </div>
  );
};

const WaitingCanvas = () => {
  return (
    <>
      <div className='loader'>Loading...</div>
    </>
  );
};

const WaitingGame = () => {
  const { state, dispatch } = useContext(NameContext);
  const returnHome = () => {
    wsToHome(state.game.pareState);
    dispatch({ type: gameStateChange, payload: 'home' });
  };

  useEffect(() => {
    wsUser.emit('serchPare');
    dispatch({ type: rematch });
    // eslint-disable-next-line
  }, []);
  return (
    <div className='waiting-container'>
      {_.isEmpty(state.game.pareState) ? <WaitingPare /> : <SeePare />}
      <div className='waiting-button-container'>
        <button className='return-button' onClick={returnHome}>戻る</button>
      </div>
    </div>
  );
};

const SeePare = () => {
  const { state } = useContext(NameContext);

  const complete = () => {
    wsUser.emit('readyGO', { roomId: state.game.room });
  };

  return (
    <>
      <div className='player-info'>
        <div className='player-box'>
          <div className='player-label'>あなた</div>
          <div className='player-name'>{state.user.name}</div>
        </div>
        <div className='player-box'>
          <div className='player-label'>あいて</div>
          {state.game.pareState.map((user, index) => (
            <div className='player-name' key={index}>{user.name}</div>
          ))}
        </div>
      </div>
      <div className='waiting-button-container'>
        <button className='ready-button' onClick={complete}>準備完了</button>
      </div>
    </>
  );
};

export default WaitingGame;
