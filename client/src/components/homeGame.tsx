import React, { useContext, useState, useEffect } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.scss';
import '../css/homeGame.scss';
import { gameStateChange, toHomeSetPure } from '../actions';
import { requestMatch } from '../actions/socket';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { wsUser } from '../plugins/socket';
import _ from 'lodash';
import '../css/loading.scss';

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100vw',
    margin: 0,
    height: '100vh',
    overflow: 'hidden',
  },
}));
const HomeGame = () => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { state, dispatch } = useContext(NameContext);
  const [requestState, setrequest] = useState('');
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    console.log(newValue);
    setValue(newValue);
  };
  const requestedUser = (socketId: string) => {
    setrequest(socketId);
  };
  const requestCancel = () => {
    setrequest('');
  };

  useEffect(() => {
    if (_.isBoolean(state.game.isMatch)) {
      if (state.game.isMatch === true) {
      } else {
        setrequest('');
        dispatch({ type: requestMatch, payload: {} });
      }
    }
    // eslint-disable-next-line
  }, [state.game.isMatch]);

  useEffect(() => {
    //homeに戻るたびに初期化
    dispatch({ type: toHomeSetPure });
    console.log('this is effect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.game.requestUser !== {}) {
    }
  }, [state.game.requestUser]);

  return (
    <div className={classes.root}>
      <AppBar color='default'>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
          aria-label='full width tabs example'
        >
          <Tab label='Home' {...a11yProps(0)} />
          <Tab label='Player' {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <div className='box'>
        <SwitchTransition mode='out-in'>
          <CSSTransition
            classNames={value === 0 ? 'toRight' : 'toLeft'}
            in={value === 0}
            key={value}
            timeout={200}
            addEndListener={(node, done) =>
              node.addEventListener('transitionend', done, false)
            }
          >
            {value === 0 ? (
              <RandomMatch />
            ) : (
              <WaitingPlayer requestedUser={requestedUser} />
            )}
          </CSSTransition>
        </SwitchTransition>
      </div>
      {!_.isEmpty(state.game.requestUser) ? (
        <Modal>
          <Request user={state.game.requestUser} />
        </Modal>
      ) : null}
      {!_.isEmpty(requestState) ? (
        <Modal>
          <RequestEmit requestCancel={requestCancel} socketId={requestState} />
        </Modal>
      ) : null}
    </div>
  );
};

interface WaitingPlayer {
  requestedUser: (socketId: string) => void;
}
const WaitingPlayer: React.FC<WaitingPlayer> = ({ requestedUser }) => {
  const { state } = useContext(NameContext);
  return (
    <div className='waiting-box'>
      <div>PLAYER</div>
      {state.socket.onlineUsers.map((user, key: number) => (
        <OnlineUser
          name={user.name}
          key={key}
          userState={user.type}
          socketId={user.socketId}
          requestedUser={requestedUser}
        />
      ))}
    </div>
  );
};

interface propsOnlinceUser extends WaitingPlayer {
  name: string;
  userState: string;
  socketId: string;
}

const OnlineUser: React.FC<propsOnlinceUser> = ({
  name,
  userState,
  socketId,
  requestedUser,
}) => {
  const initlalState = {
    word: 'オンライン',
  };

  const { state } = useContext(NameContext);

  const [buttonState, setbutton] = useState(initlalState);

  useEffect(() => {
    switch (userState) {
      case 'nomal':
        setbutton({ word: 'オンライン' });
        break;
      case 'playing':
        setbutton({ word: 'プレイ中' });
        break;
      case 'waiting':
        setbutton({ word: 'マッチ待機中' });
        break;
      default:
        break;
    }
  }, [userState]);
  const requestMatch = (socketId: string) => {
    requestedUser(socketId);
    wsUser.emit('requestMatch', { socketId: socketId, user: state.user });
  };

  return (
    <div className='flex border-bottom onLineUser'>
      <div>{name}</div>
      <div className='flex flex-word'>
        <Button
          color='primary'
          onClick={() => {
            requestMatch(socketId);
          }}
        >
          <span className='flex-word-button'>{buttonState.word}</span>
          <span>対戦を申し込む</span>
        </Button>
      </div>
    </div>
  );
};

const RandomMatch = () => {
  const { dispatch } = useContext(NameContext);
  const SerchPare = () => {
    dispatch({
      type: gameStateChange,
      payload: 'waiting',
    });
  };
  return (
    <div>
      <div className='flex wh-center mgt'>
        <div className='button  waiting-button' onClick={SerchPare}>
          ランダムマッチ
        </div>
      </div>
    </div>
  );
};

const Modal: React.FC = ({ children }) => {
  return (
    <div>
      <div className='whFull modal-overlay2'></div>
      <div className='modal-box'>{children}</div>
    </div>
  );
};

const Request = ({ user }: { user: { socketId?: string; name?: string } }) => {
  const { dispatch } = useContext(NameContext);
  const quitRequest = () => {
    wsUser.emit('quitRequest', { socketId: user.socketId });
    dispatch({ type: requestMatch, payload: {} });
  };

  const requestAgree = () => {
    wsUser.emit('createRoom', { socketId: user.socketId });
  };
  return (
    <div className=''>
      <div className='home-request'>
        {user.name}から対戦を申し込まれました。
      </div>
      <div className='flex around'>
        <div className='red button' onClick={requestAgree}>
          対戦する
        </div>
        <div className='blue button' onClick={quitRequest}>
          戻る
        </div>
      </div>
    </div>
  );
};

const RequestEmit: React.FC<{
  requestCancel: () => void;
  socketId: string;
}> = ({ requestCancel, socketId }) => {
  const quitRequest = () => {
    wsUser.emit('quitRequest', { socketId: socketId });
    requestCancel();
  };
  return (
    <>
      <div className='loader'>応答待機中です。</div>
      <div className='flex home-quit'>
        <div className='button blue' onClick={quitRequest}>
          戻る
        </div>
      </div>
    </>
  );
};

export default HomeGame;
