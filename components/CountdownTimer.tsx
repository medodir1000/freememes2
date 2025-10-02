
import React, { useState, useEffect } from 'react';

const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const difference = +endOfMonth - +now;

        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft as { days: number, hours: number, minutes: number, seconds: number };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col items-center mx-2">
            <span className="text-2xl md:text-4xl font-bold text-secondary">{String(value).padStart(2, '0')}</span>
            <span className="text-xs uppercase text-text-secondary">{interval}</span>
        </div>
    ));

    return (
        <div className="flex justify-center">
            {timerComponents.length ? timerComponents : <span>Prize draw is happening!</span>}
        </div>
    );
};

export default CountdownTimer;
