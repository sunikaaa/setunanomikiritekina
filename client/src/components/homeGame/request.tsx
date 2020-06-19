import React, { useContext, useState, useEffect } from 'react';
import { requestMatch, requestCancel } from '../../actions/socket';
import { NameContext } from '../../contexts/nameContext';
import { wsUser } from '../../plugins/socket';
import "../../css/homeGame.scss"
import '../../css/loading.scss';


const Request = ({ user }: { user: { socketId?: string; name?: string } }) => {
    const { dispatch } = useContext(NameContext);
    const quitRequest = () => {
        wsUser.emit('quitRequest', { socketId: user.socketId });
        dispatch({ type: requestCancel, payload: {} });
    };

    const requestAgree = () => {
        wsUser.emit('createRoom', { socketId: user.socketId });
        dispatch({ type: requestMatch, payload: {} });
    };




    return (
        <div className=''>
            <div className='home-request'>
                {user.name}から対戦を申し込まれました。
      </div>
            <div className='flex around'>
                <div className='red button' onClick={requestAgree}>
                    対戦する
        </div>
                <div className='blue button' onClick={quitRequest}>
                    戻る
        </div>
            </div>
        </div>
    );
};



const RequestEmit: React.FC<{
    requestCancel: () => void;
    socketId: string;
}> = ({ requestCancel, socketId }) => {
    const quitRequest = () => {
        wsUser.emit('quitRequest', { socketId: socketId });
        requestCancel();
    };


    return (
        <>
            <div className='loader'>応答待機中です。</div>
            <div className='flex home-quit'>
                <div className='button blue' onClick={quitRequest}>
                    戻る
        </div>
            </div>
        </>
    );
};



export { Request, RequestEmit }