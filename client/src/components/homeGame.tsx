import React, { useContext, useState, useEffect } from 'react';
import { NameContext } from '../contexts/nameContext';
import '../css/main.scss';
import '../css/homeGame.scss';
import { toHomeSetPure } from '../actions';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { wsUser } from '../plugins/socket';
import _ from 'lodash';
import '../css/loading.scss';
import Modal from './common/modal';
import RandomMatch from './homeGame/randomMatch'
import WaitingPlayer from './homeGame/waitingPlayer'
import Ranking from './homeGame/ranking';
import { Request, RequestEmit } from './homeGame/request';

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
    setValue(newValue);
  };
  const requestedUser = (socketId: string) => {
    setrequest(socketId);
  };
  const requestCancel = () => {
    setrequest('');
  };

  useEffect(() => {
    setrequest('');
    // eslint-disable-next-line
  }, [state.game.requestUser]);

  useEffect(() => {
    //homeに戻るたびに初期化
    dispatch({ type: toHomeSetPure });
    wsUser.emit("toHome");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <Tab label='Ranking' {...a11yProps(2)} />
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
            <div className="mgtop60 ">
              {value === 0 ? <RandomMatch /> : null}
              {value === 1 ? <WaitingPlayer requestedUser={requestedUser} /> : null}
              {value === 2 ? <Ranking /> : null}
            </div>
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








export default HomeGame;
