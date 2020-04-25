import React, { useContext } from 'react';
import './css/index.css';
import './css/main.css';
import { NameContext } from './contexts/nameContext';
import BeforeGame from './components/beforeGame';
import Game from './Game';

const App = () => {
  const { state } = useContext(NameContext);

  return <div>{state.game.loggedIn ? <Game /> : <BeforeGame />}</div>;
};

export default App;
