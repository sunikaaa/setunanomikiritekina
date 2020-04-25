import React, { useContext, useState, useEffect } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.css';
import '../css/homeGame.scss';
import { wsUser } from '../plugins/socket';
import { gameStateChange } from '../actions';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

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

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    console.log(newValue);
    setValue(newValue);
  };

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
            {value === 0 ? <RandomMatch /> : <WaitingPlayer />}
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};

const WaitingPlayer = () => {
  const { state } = useContext(NameContext);
  return (
    <div className='waiting-box'>
      <div>PLAYER</div>
      {state.socket.onlineUsers.map((user: any, key: number) => (
        <OnlineUser name={user.name} key={key} userState={user.type} />
      ))}
    </div>
  );
};

interface propsOnlinceUser {
  name: string;
  userState: string;
}

const OnlineUser = ({ name, userState }: propsOnlinceUser) => {
  const initlalState = {
    word: 'オンライン',
  };

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

  return (
    <div className='flex border-bottom onLineUser'>
      <div>{name}</div>
      <div className='flex flex-word'>
        <Button color='primary'>
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
    wsUser.emit('serchPare');
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

export default HomeGame;
