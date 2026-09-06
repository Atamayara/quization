import { useState } from 'react';
import { useSocket } from './useSocket';
import type { Player, ServerMessage } from './../../../shared/types';

// provide features of WebSocket for the host client
function useHostSocket() {
    const { isConnected, sendMessage } = useSocket({
        onMessage: ProcessMessage,
        path: 'host',
    });

    const [index, setIndex] = useState<number | null>(null);
    const [answer, setAnswer] = useState<string | null>(null);
    const [question, setQuestion] = useState<string | null>(null);
    const [speed, setSpeed] = useState<number>();
    const [correct, setCorrect] = useState<number>();
    const [incorrect, setIncorrect] = useState<number>();
    const [rest, setRest] = useState<number>();
    const [players, setPlayers] = useState<Player[]>([]);

    // Process message from the server
    function ProcessMessage(message: ServerMessage) {
        switch (message?.type) {
            case 'S2C_VIEW_UPDATE': {
                if (message.payload.index !== undefined) {
                    setIndex(message.payload.index);
                    if (message.payload.index === 0) {
                        setQuestion('');
                        setAnswer('');
                    }
                }
                if (message.payload.question !== undefined) {
                    setQuestion(message.payload.question);
                }
                if (message.payload.answer !== undefined) {
                    setAnswer(message.payload.answer);
                }
                if (message.payload.speed !== undefined) {
                    setSpeed(message.payload.speed);
                }
                if (message.payload.players !== undefined) {
                    setPlayers(message.payload.players);
                }
                if (message.payload.correct !== undefined) {
                    setCorrect(message.payload.correct);
                }
                if (message.payload.incorrect !== undefined) {
                    setIncorrect(message.payload.incorrect);
                }
                if (message.payload.rest !== undefined) {
                    setRest(message.payload.rest);
                }
                break;
            }
        }
    }

    // Start reading
    function start() {
        sendMessage({
            type: 'C2S_HOST_GLOBAL_ACTION',
            payload: {
                action: 'START_READING',
            },
        });
    }

    // Reset reading
    function pause() {
        sendMessage({
            type: 'C2S_HOST_GLOBAL_ACTION',
            payload: {
                action: 'PAUSE_READING',
            },
        });
    }

    // Stop reading
    function stop() {
        sendMessage({
            type: 'C2S_HOST_GLOBAL_ACTION',
            payload: {
                action: 'STOP_READING',
            },
        });
    }

    // Next question
    function next() {
        sendMessage({
            type: 'C2S_HOST_GLOBAL_ACTION',
            payload: {
                action: 'NEXT_QUESTION',
            },
        });
    }

    // Next question
    function prev() {
        sendMessage({
            type: 'C2S_HOST_GLOBAL_ACTION',
            payload: {
                action: 'BEFORE_QUESTION',
            },
        });
    }

    // Send marking
    function mark(id: string, judgement: boolean) {
        sendMessage({
            type: 'C2S_HOST_PLAYER_ACTION',
            payload: {
                id: id,
                action: judgement ? 'MARK_CORRECT' : 'MARK_INCORRECT',
            },
        });
    }

    // Reset tap state
    function reset() {
        sendMessage({
            type: 'C2S_HOST_GLOBAL_ACTION',
            payload: {
                action: 'RESET_TAP_STATE',
            },
        });
    }

    // Change reading speed
    function changeSpeed(speed: number) {
        sendMessage({
            type: 'C2S_HOST_CHANGE_SETTINGS',
            payload: {
                speed: speed,
            },
        });
    }

    // Change correct point
    function changeCorrectPoint(point: number) {
        sendMessage({
            type: 'C2S_HOST_CHANGE_SETTINGS',
            payload: {
                correct: point,
            },
        });
    }

    // Change incorrect point
    function changeIncorrectPoint(point: number) {
        sendMessage({
            type: 'C2S_HOST_CHANGE_SETTINGS',
            payload: {
                incorrect: point,
            },
        });
    }

    // Change rest penalty
    function changeRest(count: number) {
        sendMessage({
            type: 'C2S_HOST_CHANGE_SETTINGS',
            payload: {
                rest: count,
            },
        });
    }

    return {
        actions: {
            mark,
            start,
            pause,
            stop,
            next,
            prev,
            reset,
        },
        settings: {
            changeSpeed,
            changeCorrectPoint,
            changeIncorrectPoint,
            changeRest,
        },
        quiz: {
            index,
            question,
            answer,
            speed,
            correct,
            incorrect,
            rest,
        },
        isConnected,
        players,
    };
}

export default useHostSocket;
