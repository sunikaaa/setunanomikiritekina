import React, { useContext, useState } from 'react';
import { NameContext } from '../contexts/nameContext';
import { gameStart, setUserName } from '../actions';
import '../css/main.css';
import '../css/beforeGame.scss';
import { wsUser } from '../plugins/socket';
const BeforeGame = () => {
  const { dispatch } = useContext(NameContext);
  const [name, setName] = useState('');

  const randomMatch = (e: any): any => {
    e.preventDefault();
    wsUser.emit('setname', name);
    dispatch({
      type: gameStart,
    });
    dispatch({
      type: setUserName,
      payload: name,
    });

    return;
  };

  const keyEnter = (e: any): any => {
    if (e.which === 13) {
      return randomMatch(e);
    }
  };
  return (
    <div className='beforegame'>
      <div className='beforegame--name'>名前を入力して始めよう！</div>
      <div>
        <input
          type='text'
          onChange={(e) => setName(e.target.value)}
          onKeyUp={keyEnter}
          className='beforegame--input input'
        />
      </div>
      <div>
        <div onClick={randomMatch} className='beforegame--button'>
          TouchStart
        </div>
      </div>
    </div>
  );
};

export default BeforeGame;
