import React, { useContext, useState, useEffect } from 'react';
import { NameContext } from '../../contexts/nameContext';
import { wsUser } from '../../plugins/socket';
import Button from '@material-ui/core/Button';
import "../../css/homeGame.scss"

interface WaitingPlayer {
    requestedUser: (socketId: string) => void;
}

const WaitingPlayer: React.FC<WaitingPlayer> = ({ requestedUser }) => {
    const { state } = useContext(NameContext);
    return (
        <div className=''>
            <div>PLAYER</div>
            {state.socket.onlineUsers.map((user, key: number) => (
                <OnlineUser
                    name={user.name}
                    key={key}
                    userState={user.type}
                    socketId={user.socketId}
                    requestedUser={requestedUser}
                />
            ))}
        </div>
    );
};


interface propsOnlinceUser extends WaitingPlayer {
    name: string;
    userState: string;
    socketId: string;
}

const OnlineUser: React.FC<propsOnlinceUser> = ({
    name,
    userState,
    socketId,
    requestedUser,
}) => {
    const initlalState = {
        word: 'オンライン',
    };

    const { state } = useContext(NameContext);

    const [buttonState, setbutton] = useState(initlalState);

    useEffect(() => {
        switch (userState) {
            case 'nomal':
                setbutton({ word: 'オンライン' });
                break;
            case 'playing':
                setbutton({ word: 'プレイ中' });
                break;
            case 'waiting':
                setbutton({ word: 'マッチ待機中' });
                break;
            default:
                break;
        }
    }, [userState]);
    const requestMatch = (socketId: string) => {
        if (userState === "nomal") {
            requestedUser(socketId);
            wsUser.emit('requestMatch', { socketId: socketId, user: state.user });
        }
    };

    return (
        <div className='flex border-bottom onLineUser'>
            <div>{name}</div>
            <div className='flex flex-word'>
                <Button
                    color={userState === 'nomal' ? 'primary' : 'secondary'}
                    onClick={() => {
                        requestMatch(socketId);
                    }}
                >
                    <span className='flex-word-button'>{buttonState.word}</span>
                    <span>対戦を申し込む</span>
                </Button>
            </div>
        </div>
    );
};

export default WaitingPlayer