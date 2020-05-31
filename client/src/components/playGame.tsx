import React, { useContext, useEffect, useState } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.scss';
import '../css/playGame.scss';
import { gameStateChange, rematch } from '../actions';
import { wsUser, wsToHome } from '../plugins/socket';
import man from '../img/kenjutsu_samurai_man.png';
import woman from '../img/kenjutsu_samurai_woman.png';

function useValueRef<T>(val: T) {
  const ref = React.useRef(val);
  React.useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref;
}

interface imageArea {
  left?: string;
  right?: string;
  transform?: string;
  top?: string;
  bottom?: string;
}

const PreLoad = () => {
  const { state } = useContext(NameContext);
  const [load, setload] = useState(true);
  const reload = () => {
    setload(false);
  };

  useEffect(() => {
    if (state.game.time !== 0) {
      setload(true);
    }
  }, [state.game.time]);
  return (
    <>
      {load ? (
        <PlayGame reload={reload} />
      ) : (
          <div className='game-back whFull'></div>
        )}
    </>
  );
};

interface PlayGame {
  reload: () => void;
}

const PlayGame: React.FC<PlayGame> = ({ reload }) => {
  const { state, dispatch } = useContext(NameContext);
  const [bomState, setBomState] = useState(false);
  const [myCharacter, setmyCharacter] = useState<imageArea>({
    left: 10 + 'px',
    transform: 'rotateY(180deg)',
  });

  const [pareCharacter, setpareCharacter] = useState<imageArea>({
    right: 10 + 'px',
  });

  const [reMatch, setreMatch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now() + state.game.lag;
      if (now > state.game.time) {
        clearInterval(timer);
        setBomState(true);
      }
    }, 10);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (state.game.winner !== '') {
      if (state.game.winner === state.user.socketId) {
        //自分の勝利
        setmyCharacter({
          right: 110 + 'px',
          transform: 'rotateZ(15deg) rotateY(180deg)',
        });
        setpareCharacter({
          right: 20 + 'px',
          transform: 'rotateZ(90deg) ',
          bottom: '10px',
        });
        setTimeout(() => {
          setreMatch(true);
        }, 1000);
      } else if (state.game.winner === 'drow') {
        //引き分け時の処理
        setmyCharacter({
          left: '50%',
          transform: 'translateX(calc(-50%-90px)) rotateY(180deg)',
        });
        setpareCharacter({
          left: '50%',
          transform: 'translateX(calc(-50% + 90px)) ',
        });

        wsUser.emit('readyGO', { roomId: state.game.room });
        dispatch({ type: rematch });
        reload();
      } else {
        //相手の勝利
        setmyCharacter({
          left: 20 + 'px',
          transform: 'rotateZ(-90deg) rotateY(180deg)',
          bottom: '10px',
        });
        setpareCharacter({
          left: 110 + 'px',
          transform: 'rotateZ(-10deg) ',
        });
        setTimeout(() => {
          setreMatch(true);
        }, 1000);
      }
      dispatch({ type: 'Fire' });
    }

    // eslint-disable-next-line
  }, [state.game.winner]);

  //画面タップ時の処理
  const touchFire = () => {
    const now = Date.now() + state.game.lag;
    if (!state.game.fire) {
      if (now >= state.game.time) {
        wsUser.emit('gameFire', { time: now, roomId: state.game.room });
      }
      dispatch({ type: 'Fire' });
    }
  };

  return (
    <div onClick={touchFire} className='whFull game-back'>
      {bomState ? <Fire time={state.game.time} /> : null}
      {reMatch ? (
        <ModalDialog
          match={
            state.game.winner === state.user.socketId ? '勝利!!' : '敗北...'
          }
          reload={reload}
        />
      ) : null}
      <div className={bomState ? 'game-fire' : 'none'}>斬!!</div>
      <img
        src={man}
        alt=''
        width='70'
        height='200'
        className='absolute imageSoad'
        style={myCharacter}
      />
      <img
        src={woman}
        alt=''
        width='70'
        height='200'
        className='absolute imageSoad'
        style={pareCharacter}
      />
    </div>
  );
};

const Fire = ({ time }: any) => {
  const [nowTime, setstate] = useState(0);
  const { state } = useContext(NameContext);
  const fire = useValueRef(state.game.fire);
  let timer: NodeJS.Timer;
  useEffect(() => {
    // eslint-disable-next-line
    timer = setInterval(() => {
      if (!fire.current) {
        const now = Date.now() + state.game.lag;
        setstate(Math.floor((now - time) / 10));
      } else {
        clearInterval(timer);
      }

      return () => {
        clearInterval(timer);
      };
    }, 10);

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (state.game.winner !== '') {
      clearInterval(timer);
      setTimeout(() => {
        setstate(Math.floor((state.game.winnerTime - time) / 10));
      }, 10);
      setstate(Math.floor((state.game.winnerTime - time) / 10));
    }
    // eslint-disable-next-line
  }, [state.game.winner]);

  return (
    <div className='center flex game-time'>
      <div className='timer'>{nowTime}</div>
    </div>
  );
};

interface ModalDialog extends PlayGame {
  match: string;
}

const ModalDialog: React.FC<ModalDialog> = ({ match, reload }) => {
  const { state, dispatch } = useContext(NameContext);
  const reMatch = () => {
    wsUser.emit('readyGO', { roomId: state.game.room });
    dispatch({ type: rematch });
    reload();
  };
  const quit = () => {
    wsToHome(state.game.pareState);

    //homeに戻ると初期化される。
    dispatch({ type: gameStateChange, payload: 'home' });
  };

  return (
    <div>
      <div className='whFull modal-overlay'></div>
      <div className='modal-box game-modal-box'>
        <div
          className={`flex center mgtop20 weight800 size20 ${
            match === '勝利!!' ? 'red' : 'blue'
            }`}
        >
          {match}
        </div>
        <div className='game-modal-rematch mgtop20'>もういちど戦う？</div>
        <div className='flex around align-center '>
          <div>
            <div className='game-modal-button green word-pre' onClick={reMatch}>
              たたかう
            </div>
          </div>
          <div>
            <div className='game-modal-button blue word-pre' onClick={quit}>
              やめる
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PreLoad;
