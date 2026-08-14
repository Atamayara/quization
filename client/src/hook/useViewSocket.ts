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

// Provide features of WebSocket for the host client
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
    const [tapper, setTapper] = useState<string | null>(null);

    // Process message from the server
    function ProcessMessage(message: ServerMessage) {
        switch (message?.type) {
            case 'S2C_VIEW_UPDATE': {
                if (message.payload.index !== undefined) {
                    setIndex(message.payload.index);
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

                    case 'TAP': {
                        setTapper(message.payload.id);
                        break;
                    }

                    case 'CORRECT': {
                        setTapper(null);
                        args.correct(message.payload.id);
                        break;
                    }

                    case 'INCORRECT': {
                        setTapper(null);
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
        tapper,
        players,
    };
}

export default useHostSocket;
