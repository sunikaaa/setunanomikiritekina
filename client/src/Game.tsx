import React, { useContext } from 'react';
import { NameContext } from './contexts/nameContext';
import HomeGame from './components/homeGame';
import WaitingGame from './components/waitingGame';
import PlayGame from './components/playGame';
import { normal, playing, waiting } from './actions/gamePage';


const Game = () => {
  const { state } = useContext(NameContext);
  return <>{switchMode(state.game.userState)}</>;
};

const switchMode = (word: string) => {
  switch (word) {
    case normal:
      return <HomeGame />;
    case waiting:
      return <WaitingGame />;
    case playing:
      return <PlayGame />;
    default:
      return <HomeGame />;
  }
};

export default Game;
