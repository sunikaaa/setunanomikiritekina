import React, { useContext, useEffect, useState } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.css';
import { wsUser } from '../plugins/socket';

function useValueRef<T>(val: T) {
  const ref = React.useRef(val);
  React.useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref;
}

const PlayGame = () => {
  const { state, dispatch } = useContext(NameContext);
  const [bomState, setBomState] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (now > state.game.time) {
        clearInterval(timer);
        setBomState(true);
      }
    }, 10);
    // eslint-disable-next-line
  }, []);

  const touchFire = () => {
    const now = Date.now();
    if (!state.game.fire) {
      if (now >= state.game.time) {
        wsUser.emit('gameFire', now);
      }
      dispatch({ type: 'Fire' });
    }
  };

  return (
    <div onClick={touchFire} className='whFull'>
      {bomState ? <Fire time={state.game.time} /> : null}
    </div>
  );
};

const Fire = ({ time }: any) => {
  const [nowTime, setstate] = useState(0);
  const { state } = useContext(NameContext);
  const fire = useValueRef(state.game.fire);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!fire.current) {
        const now = Date.now();
        setstate(now - time);
      } else {
        clearInterval(timer);
      }

      return () => {
        clearInterval(timer);
      };
    }, 10);
    // eslint-disable-next-line
  }, []);

  return (
    <div className='whFull'>
      Fire!!
      <div className='timer'>{nowTime}</div>
    </div>
  );
};

export default PlayGame;
