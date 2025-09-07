import { useRef, useCallback, useEffect } from "react";

const getAudioContext = () => {
    if (typeof window !== "undefined") {
        return new(window.AudioContext || window.webkitAudioContext)();
    }
    return null;
};

export const useAudio = () => {
    const audioContextRef = useRef(null);

    useEffect(() => {
        // Pulisce l'istanza di AudioContext quando il componente viene smontato
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, []);

    const playBeep = useCallback((frequency = 440, duration = 200) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = getAudioContext();
            }
            if (!audioContextRef.current) return;

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
            oscillator.start();

            gainNode.gain.setValueAtTime(1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (e) {
            console.error("Errore nella riproduzione del beep:", e);
        }
    }, []);

    return { playBeep };
};