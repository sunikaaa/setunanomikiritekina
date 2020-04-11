import React, { useContext, useState, useEffect } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.css';
import '../css/waitingGame.scss';
import { wsUser } from '../plugins/socket';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component='div'
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </Typography>
  );
}

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
const WaitingGame = () => {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const handleChangeIndex = (index: number) => {
    setValue(index);
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
        <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
          <TabPanel value={value} index={0}>
            <RandomMatch />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <WaitingPlayer />
          </TabPanel>
        </SwipeableViews>
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
        <Typography color='primary'>
          {buttonState.word}
          <Button color='default'>対戦を申し込む</Button>
        </Typography>
      </div>
    </div>
  );
};

const RandomMatch = () => {
  const SerchPare = () => {
    wsUser.emit('serchPare');
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

export default WaitingGame;
