import { useState } from 'react';
import { useSocket } from './useSocket';
import type { Player, ServerMessage } from './../../../shared/types';

type useHostSocketArgs = {
    start: () => void;
    pause: () => void;
    stop: () => void;
    correct: (id: string) => void;
    incorrect: (id: string) => void;
};

// provide features of WebSocket for the host client
function useHostSocket(args: useHostSocketArgs) {
    const { isConnected } = useSocket({
        onMessage: ProcessMessage,
        path: 'view',
    });

    const [index, setIndex] = useState<number | null>(null);
    const [answer, setAnswer] = useState<string | null>(null);
    const [question, setQuestion] = useState<string | null>(null);
    const [speed, setSpeed] = useState<number>();
    const [players, setPlayer] = useState<Player[]>([]);

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
                    setPlayer(message.payload.players);
                }
                break;
            }

            case 'S2C_VIEW_ACTION': {
                switch (message.payload.action) {
                    case 'START_READING': {
                        args.start();
                        break;
                    }

                    case 'PAUSE_READING': {
                        args.pause();
                        break;
                    }

                    case 'STOP_READING': {
                        args.stop();
                        break;
                    }

                    case 'CORRECT': {
                        args.correct(message.payload.id);
                        break;
                    }

                    case 'INCORRECT': {
                        args.incorrect(message.payload.id);
                        break;
                    }
                }
                break;
            }
        }
    }

    return {
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
