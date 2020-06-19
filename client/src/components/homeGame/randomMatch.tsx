import React, { useContext } from 'react'
import { gameStateChange, aloneStart } from '../../actions';
import { NameContext } from '../../contexts/nameContext';
import { startGame, matchUser } from '../../actions/socket';
import "../../css/homeGame.scss"
import "../../css/main.scss"


const RandomMatch = () => {
    const { dispatch } = useContext(NameContext);
    const SerchPare = () => {
        dispatch({
            type: gameStateChange,
            payload: 'waiting',
        });
    };
    const startAlone = () => {
        dispatch({
            type: startGame,
            payload: Date.now() + Math.random() * 5000 + 4000
        })
        dispatch({
            type: aloneStart,
        })
        dispatch({ type: matchUser, payload: [{ name: 'CPU', socketId: 'CPU' }] });
    }
    return (
        <div className='flex wh-center  flex-column w100 text-center'>
            <div className='button  waiting-button' onClick={SerchPare}>ランダムマッチ</div>
            <div className="button waiting-button" onClick={startAlone}>ひとりで遊ぶ</div>
        </div>
    );
};

export default RandomMatch