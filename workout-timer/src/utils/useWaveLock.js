import { useEffect, useState } from 'react';

export const useWakeLock = (isActive) => {
    const [wakeLock, setWakeLock] = useState(null);

    useEffect(() => {
        let sentinel = null;

        const requestWakeLock = async() => {
            if ('wakeLock' in navigator && isActive) {
                try {
                    sentinel = await navigator.wakeLock.request('screen');
                    console.log('Wake Lock is active');
                    setWakeLock(sentinel);

                    // Rilascia automaticamente il lock se l'utente cambia tab
                    sentinel.addEventListener('release', () => {
                        // console.log('Wake Lock was released');
                        setWakeLock(null);
                    });
                } catch (err) {
                    console.error(`${err.name}, ${err.message}`);
                }
            }
        };

        const releaseWakeLock = () => {
            if (sentinel) {
                sentinel.release();
                setWakeLock(null);
                // console.log('Wake Lock released');
            }
        };

        if (isActive) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        // Cleanup function
        return () => {
            releaseWakeLock();
        };
    }, [isActive]);

    return wakeLock;
};