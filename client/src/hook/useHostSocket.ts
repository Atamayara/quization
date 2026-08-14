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
    const [players, setPlayers] = useState<Player[]>([]);

    // Process message from the server
    function ProcessMessage(message: ServerMessage) {
        switch (message?.type) {
            case 'S2C_VIEW_UPDATE': {
                if (message.payload.index) {
                    setIndex(message.payload.index);
                }
                if (message.payload.question) {
                    setQuestion(message.payload.question);
                }
                if (message.payload.answer) {
                    setAnswer(message.payload.answer);
                }
                if (message.payload.speed) {
                    setSpeed(message.payload.speed);
                }
                if (message.payload.players) {
                    setPlayers(message.payload.players);
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

    return {
        action: {
            mark,
            start,
            pause,
            stop,
            next,
            prev,
            reset,
        },
        quiz: {
            index,
            question,
            answer,
            speed,
        },
        isConnected,
        players,
    };
}

export default useHostSocket;
