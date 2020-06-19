import React, { useContext, useEffect, useState } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.scss';
import '../css/playGame.scss';
import { rematch } from '../actions';
import { wsUser } from '../plugins/socket';
import man from '../img/kenjutsu_samurai_man.png';
import woman from '../img/kenjutsu_samurai_woman.png';
import { finishGame } from '../actions/socket';
import { knifeTouch, swordDrow, handgunFire, backImpact, backWind } from './playGame/musicLoad'
import Result from './playGame/result'
import { Fire } from './playGame/fire';


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

const PlayGame: React.FC<any> = ({ reload }) => {
  const { state, dispatch } = useContext(NameContext);
  const [bomState, setBomState] = useState(false);
  const [otetuki, setOtetuki] = useState(false);
  const [myCharacter, setmyCharacter] = useState<imageArea>({
    left: 10 + 'px',
    transform: 'rotateY(180deg)',
  });

  const [pareCharacter, setpareCharacter] = useState<imageArea>({
    right: 10 + 'px',
  });

  const [reMatch, setreMatch] = useState(false);
  const alone = state.game.isAlone;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = alone ? Date.now() : Date.now() + state.game.lag;
      if (now > state.game.time) {
        clearInterval(timer);
        setBomState(true);
        handgunFire.play();

      }
    }, 10);
    backImpact.play();
    backWind.play();
    return () => {
      backWind.stop();
      clearInterval(timer);
    };

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (state.game.winner !== '') {
      if (state.game.winner === state.user.socketId) {
        //自分の勝利
        setmyCharacter({
          right: 150 + 'px',
          transform: 'rotateZ(15deg) rotateY(180deg)',
        });
        setpareCharacter({
          right: 100 + 'px',
          transform: 'rotateZ(90deg) ',
          bottom: '15px',
        });
        setTimeout(() => {
          setreMatch(true);
        }, 1000);
        knifeTouch.play();
      } else if (state.game.winner === 'drow') {
        swordDrow.play();
        //引き分け時の処理
        setmyCharacter({
          left: '50%',
          transform: 'translateX(calc(-50%-90px)) rotateY(180deg)',
        });
        setpareCharacter({
          left: '50%',
          transform: 'translateX(calc(-50% + 90px)) ',
        });

        setTimeout(() => {
          wsUser.emit('readyGO', { roomId: state.game.room });
          dispatch({ type: rematch });
          reload();
        }, 1000);
      } else {
        //相手の勝利
        setmyCharacter({
          left: 30 + 'px',
          transform: 'rotateZ(-90deg) rotateY(180deg)',
          bottom: '10px',
        });
        setpareCharacter({
          left: 120 + 'px',
          transform: 'rotateZ(-10deg) ',
        });
        setTimeout(() => {
          setreMatch(true);
        }, 1000);
      }
      setOtetuki(false);
      dispatch({ type: 'Fire' });
    }

    // eslint-disable-next-line
  }, [state.game.winner]);

  //画面タップ時の処理
  const touchFire = () => {
    const now = alone ? Date.now() : Date.now() + state.game.lag;
    if (!state.game.fire) {
      if (now >= state.game.time) {
        alone ? dispatch({ type: finishGame, payload: { time: now - state.game.time, socketId: state.user.socketId } }) : wsUser.emit('gameFire', { time: now, roomId: state.game.room });
      } else {
        setOtetuki(true);
        !alone && wsUser.emit('gameFire', { time: 0, roomId: state.game.room });
      }
      dispatch({ type: 'Fire' });
    }
  };

  return (
    <div onClick={touchFire} className='whFull game-back ovh'>
      <div className='flex around align-center game-header'>
        <div className="game-name">{state.user.name}</div>
        <div>ＶＳ</div>
        <div className="game-name">{alone ? `CPULevel${state.game.aloneCount + 1}` : state.game.pareState[0].name}</div>
      </div>
      {bomState ? <Fire time={state.game.time} /> : null}
      {reMatch ? (
        <Result
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
      <div className={otetuki ? 'mask' : 'none'}></div>
    </div>
  );
};


export default PreLoad;
