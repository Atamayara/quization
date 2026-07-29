import { ClientMessage, ServerMessage } from '../shared/types.ts';
import {
    getIdBySocket,
    registerSocket,
    sendToHost,
    sendToHostAndView,
    sendToPlayer,
    sendToView,
} from './connectionManager.ts';
import {
    getPlayersAll,
    getQuiz,
    joinPlayer,
    moveQuiz,
    tapped,
} from './gameMaster.ts';

// Process messages from players
export function playerMessageHandler(
    message: ClientMessage,
    socket: WebSocket,
) {
    switch (message.type) {
        // (Re)Join
        case 'C2S_JOIN': {
            const result = joinPlayer(
                message.payload.name,
                message.payload.id,
                message.payload.key,
            );
            registerSocket(result.id, socket);
            sendToPlayer({
                type: 'S2C_JOIN_ACK',
                payload: {
                    id: result.id,
                    key: result.key,
                },
            });
            sendToPlayer({
                type: 'S2C_SET_UI_STATE',
                payload: {
                    player: result,
                },
            });
            sendToHostAndView({
                type: 'S2C_VIEW_UPDATE',
                payload: {
                    players: getPlayersAll(),
                },
            });
            break;
        }

        // Tap to answer
        case 'C2S_TAP': {
            const time = 0; // [TODO] Timing
            const id = getIdBySocket(socket);
            if (id) {
                const result = tapped(id, time);
                if (result.stopping) {
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: { action: 'STOP_READING' },
                    });
                }
                if (result.players) {
                    const message: ServerMessage = {
                        type: 'S2C_VIEW_UPDATE',
                        payload: { players: result.players },
                    };
                    sendToHostAndView(message);
                }
                result.players?.forEach((p) => {
                    if (!p.isOnline) return;
                    sendToPlayer(
                        {
                            type: 'S2C_SET_UI_STATE',
                            payload: {
                                player: p,
                                // [TODO] Additional UI settings
                            },
                        },
                        p.id,
                    );
                });
            }
            break;
        }
    }
}

// Process messages from a host
export function hostMessageHandler(message: ClientMessage) {
    switch (message.type) {
        // Global actions by the host
        case 'C2S_HOST_GLOBAL_ACTION': {
            switch (message.payload.action) {
                case 'START_READING':
                case 'STOP_READING':
                case 'PAUSE_READING': {
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: {
                            action: message.payload.action,
                        },
                    });
                    break;
                }

                case 'NEXT_QUESTION': {
                    moveQuiz(1);
                    sendQuiz();
                    break;
                }

                case 'BEFORE_QUESTION': {
                    moveQuiz(-1);
                    sendQuiz();
                    break;
                }
            }
            break;
        }

        // Actions for a player by the host
        case 'C2S_HOST_PLAYER_ACTION':
            switch (message.payload.action) {
                case 'MARK_CORRECT':

                case 'MARK_INCORRECT':
                case 'ADJUST_SCORE':
            }
            break;
    }
}

function sendQuiz() {
    const quiz = getQuiz();
    sendToHostAndView({
        type: 'S2C_VIEW_UPDATE',
        payload: {
            index: quiz.index,
            question: quiz.question,
            answer: quiz.answer,
        },
    });
}
