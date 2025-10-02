
import React, { useEffect, useState } from 'react';

interface NotificationPopupProps {
    message: string;
    type: 'success' | 'info' | 'error';
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow animation to finish before calling onClose
            setTimeout(onClose, 300);
        }, 4700);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    const bgColor = {
        success: 'bg-green-500',
        info: 'bg-blue-500',
        error: 'bg-red-500',
    }[type];

    return (
        <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ease-in-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`${bgColor} text-white font-bold rounded-lg shadow-2xl p-4 flex items-center`}>
                <span className="mr-3">
                    {type === 'success' && '🎉'}
                    {type === 'info' && '🔥'}
                    {type === 'error' && '❌'}
                </span>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default NotificationPopup;
