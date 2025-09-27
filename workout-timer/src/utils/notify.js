// src/utils/notify.js
export const requestNotificationPermission = async() => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
        const perm = await Notification.requestPermission();
        return perm === "granted";
    }
    return false;
};

export const notify = (title, body) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: "/icon-192.png", // opzionale, da mettere in public/
        });
    }
};