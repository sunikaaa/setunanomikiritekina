import React from 'react';
import '../../css/main.scss'
const Modal: React.FC = ({ children }) => {
    return (
        <div>
            <div className='whFull modal-overlay2'></div>
            <div className='modal-box'>{children}</div>
        </div>
    );
};

export default Modal;