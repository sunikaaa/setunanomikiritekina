import React, { useContext, useEffect, useState } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/loading.scss';
import '../css/main.scss';
import _ from 'lodash';
import { gameStateChange, rematch } from '../actions';
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

  useEffect(() => {
    wsUser.emit('serchPare');
    dispatch({ type: rematch });
    // eslint-disable-next-line
  }, []);
  return (
    <>
      {_.isEmpty(state.game.pareState) ? <WaitingPare /> : <SeePare />}
      <div>
        <div onClick={returnHome} className='button'>
          戻る
        </div>
      </div>
    </>
  );
};

const SeePare = () => {
  const { state } = useContext(NameContext);
  const [OK, setOK] = useState(false);
  const complete = () => {
    wsUser.emit('readyGO', { roomId: state.game.room });
    setOK(true);
  };
  return (
    <>
      <div className='flex around'>
        <div className='flex column'>
          <div>あなた</div>
          <div className='size14'>
            {state.user.name}
            <div className='blue'>{OK ? 'OK!' : null}</div>
          </div>
        </div>
        <div className='flex column'>
          <div>あいて</div>
          {state.game.pareState.map((user, index) => (
            <div key={index} className='size14'>
              {user.name}
              <div className='blue'>{user.game.ready ? 'OK!' : null}</div>
            </div>
          ))}
        </div>
      </div>
      <div className='flex center'>
        <div onClick={complete} className='button'>
          準備完了
        </div>
      </div>
    </>
  );
};

export default WaitingGame;
