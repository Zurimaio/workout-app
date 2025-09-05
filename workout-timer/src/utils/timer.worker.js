let intervalId = null;
let remainingTime = 0;

self.onmessage = (e) => {
    const { type, payload } = e.data;

    const startInterval = () => {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            remainingTime -= 1;
            if (remainingTime <= 0) {
                remainingTime = 0;
                self.postMessage({ type: 'UPDATE_TIME', payload: remainingTime });
                clearInterval(intervalId);
                self.postMessage({ type: 'TIMER_END' });
            } else {
                self.postMessage({ type: 'UPDATE_TIME', payload: remainingTime });
            }
        }, 1000);
    };

    switch (type) {
        case 'START_TIMER':
            remainingTime = Math.ceil(payload);
            self.postMessage({ type: 'UPDATE_TIME', payload: remainingTime });
            startInterval();
            break;

        case 'PAUSE_TIMER':
            clearInterval(intervalId);
            intervalId = null;
            break;

        case 'RESUME_TIMER':
            remainingTime = Math.ceil(payload);
            self.postMessage({ type: 'UPDATE_TIME', payload: remainingTime });
            startInterval();
            break;

        case 'STOP_TIMER':
            clearInterval(intervalId);
            intervalId = null;
            remainingTime = 0;
            self.postMessage({ type: 'UPDATE_TIME', payload: remainingTime });
            break;
    }
};