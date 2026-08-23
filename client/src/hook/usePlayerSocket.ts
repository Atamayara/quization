import { useSocket } from './useSocket';
import type { Player, ServerMessage } from './../../../shared/types';
import { useState } from 'react';

// provide features of WebSocket for player clients
function usePlayerSocket() {
    const [player, setPlayer] = useState<Player | null>(null);
    const [isJoined, setIsJoined] = useState<boolean>(false);

    const { isConnected, sendMessage } = useSocket({
        onMessage: ProcessMessage,
        path: 'player',
    });

    // Send join message
    function join(name?: string) {
        if (isJoined) {
            return;
        }
        const id = localStorage.getItem('playerId');
        const key = localStorage.getItem('playerKey');
        sendMessage({
            type: 'C2S_JOIN',
            payload: {
                name: name !== '' ? name : undefined,
                id: id ?? undefined,
                key: key ?? undefined,
            },
        });
    }

    // Process message from the server
    function ProcessMessage(message: ServerMessage) {
        switch (message?.type) {
            case 'S2C_JOIN_ACK': {
                localStorage.setItem('playerId', message.payload.id);
                localStorage.setItem('playerKey', message.payload.key);
                setIsJoined(true);
                break;
            }

            case 'S2C_SET_UI_STATE': {
                setPlayer(message.payload.player);
                // [TODO] Additional UI settings
                break;
            }
        }
    }

    // Send a tap message
    function tapped() {
        sendMessage({ type: 'C2S_TAP' });
    }

    return { player, join, tapped, isConnected, isJoined };
}

export default usePlayerSocket;
