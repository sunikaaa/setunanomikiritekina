import React, { useContext, useEffect, useState } from 'react';
import { NameContext } from '../../contexts/nameContext';
import Modal from '../common/modal';
import { rematch, aloneStart, gameStateChange, YOULOSE, levelUP } from '../../actions';
import { wsUser, wsToHome } from '../../plugins/socket';
import { startGame } from '../../actions/socket';
import { backWind } from './musicLoad';
import '../../css/playGame.scss';

const Result: React.FC<any> = ({ match, reload }) => {
    const { state, dispatch } = useContext(NameContext);
    const alone = state.game.isAlone;
    const reMatch = () => {
        reload();
        dispatch({ type: rematch });
        dispatch({ type: levelUP });
        !alone && wsUser.emit('readyGO', { roomId: state.game.room });
        if (alone) {
            dispatch({
                type: aloneStart,
            })
            dispatch({ type: startGame, payload: Date.now() + Math.random() * 5000 + 4000 })
        }
    };
    const quit = () => {
        wsToHome(state.game.pareState);
        if (match === "勝利!!") {
            alone && wsUser.emit("RESULTCOUNT", { user: state.user.name, count: state.game.aloneCount + 1 });
        }

        //homeに戻ると初期化される。
        dispatch({ type: gameStateChange, payload: 'home' });

    };
    useEffect(() => {
        backWind.stop();
        if (match !== '勝利!!') {
            alone && wsUser.emit("RESULTCOUNT", { user: state.user.name, count: state.game.aloneCount });
            dispatch({ type: YOULOSE });
        }
        // eslint-disable-next-line
    }, []);

    return (
        <Modal>
            <div
                className={`flex center mgtop20 weight800 size20 ${
                    match === '勝利!!' ? 'red' : 'blue'
                    }`}
            >
                {match}
            </div>
            <div className='game-modal-rematch mgtop20'>もういちど戦う？</div>
            <div className='flex around align-center '>
                <div>
                    <div className='game-modal-button green word-pre' onClick={reMatch}>たたかう</div>
                </div>
                <div>
                    <div className='game-modal-button blue word-pre' onClick={quit}>やめる</div>
                </div>
            </div>
        </Modal>
    );
};
export default Result;