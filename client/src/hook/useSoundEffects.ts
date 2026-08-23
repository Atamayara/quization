import { useEffect, useRef } from 'react';

// Sound effects list
const SEs: [string, string][] = [
    ['correct', './sounds/correct.mp3'],
    ['incorrect', './sounds/incorrect.mp3'],
    ['quiz', './sounds/quiz.mp3'],
    ['tap', './sounds/tap.mp3'],
];
// Provide feature to play sound effects
function useSoundEffects() {
    const contextRef = useRef<AudioContext>(new AudioContext());
    const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());

    // Get and resume AudioContext
    function getContext(): AudioContext {
        const context = contextRef.current;
        if (context.state === 'suspended') {
            context.resume();
        }
        return contextRef.current;
    }

    // Play sound effects
    function play(key: string) {
        const context = getContext();
        const buffer = buffersRef.current.get(key);
        if (!buffer) {
            return;
        }

        const source = context.createBufferSource();
        source.buffer = buffer;

        source.connect(context.destination);

        source.start(0);
    }

    // Preload audio files
    useEffect(() => {
        const context = getContext();
        SEs.map(async ([key, path]) => {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await context.decodeAudioData(arrayBuffer);
            buffersRef.current.set(key, buffer);
        });
    }, []);

    return play;
}

export default useSoundEffects;
