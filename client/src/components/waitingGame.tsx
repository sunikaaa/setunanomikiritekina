import React, { useContext, useEffect } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/loading.scss';
import '../css/main.css';
import _ from 'lodash';
import { gameStateChange } from '../actions';
import { wsToHome, wsUser } from '../plugins/socket';
const WaitingPare = () => {
  useEffect(() => {
    wsUser.emit('serchPare');
  }, []);
  return (
    <div>
      <div className='flex center'>
        <div>
          <WaitingCanvas />
          対戦相手を待っています......
        </div>
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
  return (
    <>
      {_.isEmpty(state.game.pareState) ? <WaitingPare /> : <SeePare />}
      <div>
        <button onClick={returnHome}>戻る</button>
      </div>
    </>
  );
};

const SeePare = () => {
  const { state } = useContext(NameContext);

  const complete = () => {
    wsUser.emit('readyGO', state.game.room);
  };

  return (
    <>
      <div className='flex around'>
        <div className='flex column'>
          <div>あなた</div>
          <div>{state.user.name}</div>
        </div>
        <div className='flex column'>
          <div>あいて</div>
          {state.game.pareState.map((user, index) => (
            <div key={index}>{user.name}</div>
          ))}
        </div>
      </div>
      <div className='flex center'>
        <button onClick={complete}>準備完了</button>
      </div>
    </>
  );
};

export default WaitingGame;
