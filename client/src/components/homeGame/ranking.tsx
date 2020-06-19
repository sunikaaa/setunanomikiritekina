import React, { useContext, useEffect } from 'react';
import { NameContext } from '../../contexts/nameContext';
import { wsUser } from '../../plugins/socket';
import "../../css/homeGame.scss"

const Ranking = () => {
    const { state } = useContext(NameContext)
    useEffect(() => {
        wsUser.emit("showResult");
    }, [])
    return (<div>
        <div>
            ランキング
    </div>
        <table className="ranking-table">
            <tr><th>順位</th><th className="ranking-name">名前</th><th>記録</th></tr>
            {state.socket.ranking.map((value, index) => {
                return (<tr><td>{value.rank}位</td><td className="ranking-name">{value.user}</td><td>{value.count}連斬</td></tr>)
            })}
        </table>
    </div>
    )
}

export default Ranking