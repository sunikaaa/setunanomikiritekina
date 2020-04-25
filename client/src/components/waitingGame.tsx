import React, { useContext } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/loading.scss';
import '../css/main.css';
import _ from 'lodash';
import { gameStateChange } from '../actions';
import { wsToHome } from '../plugins/socket';
const WaitingPare = () => {
  const { state, dispatch } = useContext(NameContext);

  const returnHome = () => {
    wsToHome(state.game.pareState);
    dispatch({ type: gameStateChange, payload: 'home' });
  };
  return (
    <div>
      <div className='flex center'>
        <div>
          <WaitingCanvas />
          対戦相手を待っています......
        </div>
      </div>
      <button onClick={returnHome}>戻る</button>
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
  const { state } = useContext(NameContext);
  return <>{_.isEmpty(state.game.pareState) ? <WaitingPare /> : <SeePare />}</>;
};

const SeePare = () => {
  const { state } = useContext(NameContext);
  console.log(state.user.name);
  return (
    <>
      <div className='flex around'>
        <div className='flex column'>
          <div>あなた</div>
          <div>{state.user.name}</div>
        </div>
        <div className='flex column'>
          <div>あいて</div>
          <div>{state.game.pareState.map((user) => user.name)}</div>
        </div>
      </div>
      <div className='flex center'>
        <button>準備完了</button>
      </div>
    </>
  );
};

export default WaitingGame;
