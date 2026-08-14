import { ClientMessage, ServerMessage } from '../shared/types.ts';
import {
    getIdBySocket,
    registerSocket,
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
    mark,
    changeScore,
    getAnswererId,
    setTime,
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
            sendToPlayer(
                {
                    type: 'S2C_JOIN_ACK',
                    payload: {
                        id: result.id,
                        key: result.key,
                    },
                },
                result.id,
            );
            sendToPlayer(
                {
                    type: 'S2C_SET_UI_STATE',
                    payload: {
                        player: result,
                    },
                },
                result.id,
            );
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
            const id = getIdBySocket(socket);
            if (id) {
                const result = tapped(id);
                const answererId = getAnswererId();
                if (answererId) {
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: { action: 'PAUSE_READING' },
                    });
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: { action: 'TAP', id: answererId },
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
                case 'START_READING': {
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: {
                            action: 'START_READING',
                        },
                    });
                    setTime();
                    break;
                }
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
        case 'C2S_HOST_PLAYER_ACTION': {
            const id = message.payload.id;
            switch (message.payload.action) {
                case 'MARK_CORRECT': {
                    mark(id, true);
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: {
                            action: 'CORRECT',
                            id: id,
                        },
                    });
                    break;
                }
                case 'MARK_INCORRECT': {
                    mark(id, false);
                    const answererId = getAnswererId();
                    sendToView({
                        type: 'S2C_VIEW_ACTION',
                        payload: {
                            action: 'INCORRECT',
                            id: id,
                        },
                    });
                    if (answererId) {
                        sendToView({
                            type: 'S2C_VIEW_ACTION',
                            payload: { action: 'TAP', id: id },
                        });
                    }
                    break;
                }
                case 'ADJUST_SCORE': {
                    changeScore(id, message.payload.value);
                    break;
                }
            }
            const players = getPlayersAll();
            sendToHostAndView({
                type: 'S2C_VIEW_UPDATE',
                payload: {
                    players: players,
                },
            });
            const player = players.find((p) => p.id === id);
            if (player) {
                sendToPlayer(
                    {
                        type: 'S2C_SET_UI_STATE',
                        payload: {
                            player: player,
                        },
                    },
                    id,
                );
            }
            break;
        }
    }
}

function sendQuiz() {
    const quiz = getQuiz();
    sendToView({
        type: 'S2C_VIEW_ACTION',
        payload: {
            action: 'PAUSE_READING',
        },
    });
    sendToHostAndView({
        type: 'S2C_VIEW_UPDATE',
        payload: {
            index: quiz.index,
            question: quiz.question,
            answer: quiz.answer,
        },
    });
}
