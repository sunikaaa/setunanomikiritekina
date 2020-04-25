import React, { useContext } from 'react';
import { NameContext } from './contexts/nameContext';
import HomeGame from './components/homeGame';
import WaitingGame from './components/waitingGame';

const Game = () => {
  const { state } = useContext(NameContext);
  return <>{switchMode(state.game.gameState)}</>;
};

const switchMode = (word: string) => {
  switch (word) {
    case 'home':
      return <HomeGame />;
    case 'waiting':
      return <WaitingGame />;
    default:
      return <HomeGame />;
  }
};

export default Game;
