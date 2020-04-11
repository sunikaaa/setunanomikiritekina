import React, { useContext } from 'react';
import './css/index.css';
import './css/main.css';
import { NameContext } from './contexts/nameContext';
import BeforeGame from './components/beforeGame';
import WaitingGame from './components/waitingGame';

const App = () => {
  const { state } = useContext(NameContext);
  return <div>{state.game.loggedIn ? <WaitingGame /> : <BeforeGame />}</div>;
};

export default App;
