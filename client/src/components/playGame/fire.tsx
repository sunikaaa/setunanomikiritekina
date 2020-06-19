import React, { useContext, useEffect, useState } from 'react';
import { useValueRef } from '../common/useValueRef';
import { NameContext } from '../../contexts/nameContext';
import { finishGame } from '../../actions/socket';
import '../../css/playGame.scss';


export const Fire = ({ time }: any) => {
    const [nowTime, setstate] = useState(0);
    const { state, dispatch } = useContext(NameContext);
    const fire = useValueRef(state.game.winner);
    let timer: NodeJS.Timer;
    const alone = state.game.isAlone;

    useEffect(() => {
        // eslint-disable-next-line
        timer = setInterval(() => {
            // eslint-disable-next-line
            const aiteTime = state.game.time + 500 - state.game.aloneCount * 20;
            const now = alone ? Date.now() : Date.now() + state.game.lag;
            if (!fire.current) {
                setstate(Math.floor((now - time) / 10));
            } else {
                clearInterval(timer);
            }
            if (alone && now > aiteTime) {
                dispatch({ type: finishGame, payload: { socketId: 'CPU', time: aiteTime - state.game.time } })
            }

            return () => {
                clearInterval(timer);
            };
        }, 10);

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (state.game.winner !== '') {
            clearInterval(timer);
            setTimeout(() => {
                setstate(Math.floor(state.game.winnerTime / 10));
            }, 10);
        }
        return () => {
            clearInterval(timer);
        };
        // eslint-disable-next-line
    }, [state.game.winner]);

    return (
        <div className='center flex game-time'>
            <div className='timer'>{nowTime}</div>
        </div>
    );
};

