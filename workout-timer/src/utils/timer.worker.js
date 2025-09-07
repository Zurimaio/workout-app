let interval = null;
let remainingTime = 0;

self.onmessage = (e) => {
    const { type, payload } = e.data;

    const clearExistingInterval = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };

    switch (type) {
        case 'START_TIMER':
            clearExistingInterval();
            remainingTime = payload;
            postMessage({ type: 'UPDATE_TIME', payload: remainingTime });

            interval = setInterval(() => {
                remainingTime -= 1;
                postMessage({ type: 'UPDATE_TIME', payload: remainingTime });

                if (remainingTime <= 0) {
                    clearExistingInterval();
                    postMessage({ type: 'TIMER_END' });
                }
            }, 1000);
            break;

        case 'PAUSE_TIMER':
            clearExistingInterval();
            break;

        case 'RESUME_TIMER':
            clearExistingInterval();
            interval = setInterval(() => {
                remainingTime -= 1;
                postMessage({ type: 'UPDATE_TIME', payload: remainingTime });

                if (remainingTime <= 0) {
                    clearExistingInterval();
                    postMessage({ type: 'TIMER_END' });
                }
            }, 1000);
            break;

        case 'STOP_TIMER':
            clearExistingInterval();
            remainingTime = 0;
            postMessage({ type: 'UPDATE_TIME', payload: remainingTime });
            break;

        default:
            console.warn('Unknown worker message type:', type);
    }
};