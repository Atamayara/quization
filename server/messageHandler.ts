import { ClientMessage, ServerMessage } from '../shared/types.ts';
import {
    getIdBySocket,
    registerSocket,
    sendToHost,
    sendToPlayer,
    sendToView,
} from './connectionManager.ts';
import { joinPlayer, tapped } from './gameMaster.ts';

export function messageHandler(data: ClientMessage, socket: WebSocket) {
    switch (data.type) {
        // (Re)Join
        case 'C2S_JOIN': {
            const result = joinPlayer(
                data.payload.name,
                data.payload.id,
                data.payload.key,
            );
            registerSocket(result.id, socket);
            const ackMessage: ServerMessage = {
                type: 'S2C_JOIN_ACK',
                payload: {
                    id: result.id,
                    key: result.key,
                },
            };
            sendToPlayer(ackMessage);
            const uiMessage: ServerMessage = {
                type: 'S2C_SET_UI_STATE',
                payload: {
                    player: result,
                },
            };
            sendToPlayer(uiMessage);
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
                    sendToView(message);
                    sendToHost(message);
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

        // Global actions by the host
        case 'C2S_HOST_GLOBAL_ACTION': {
            break;
        }

        // Actions for a player by the host
        case 'C2S_HOST_PLAYER_ACTION':
            break;
    }
}
