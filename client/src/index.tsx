import React, { useReducer, useEffect } from 'react';
import reducer from './reducer';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { NameContext, NameInitialState } from './contexts/nameContext';
import { WrapwsUser } from './plugins/socket';
const MyApp: React.FC = ({ children }): any => {
  const [state, dispatch] = useReducer(reducer, NameInitialState);
  useEffect(() => {
    WrapwsUser({ state, dispatch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <NameContext.Provider value={{ state, dispatch }}>
      {children}
    </NameContext.Provider>
  );
};
ReactDOM.render(
  <MyApp>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </MyApp>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
