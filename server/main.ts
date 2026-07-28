import { ClientMessage } from '../shared/types.ts';
import {
    deleteHostSocket,
    deleteViewSocket,
    tryRegisterHostSocket,
    tryRegisterViewSocket,
} from './connectionManager.ts';
import { hostMessageHandler, playerMessageHandler } from './messageHandler.ts';

export function handler(request: Request): Response {
    // Access to pages
    const url = new URL(request.url);
    if (request.headers.get('upgrade') !== 'websocket') {
        return new Response('');
    }

    // WebSocket connection
    const { socket, response } = Deno.upgradeWebSocket(request);

    switch (url.pathname) {
        // Connection with players
        case '/ws/player':
            socket.onopen = () => console.log('[Log] A player connected');

            socket.onmessage = (event) => {
                console.log('[Log] A player message received');
                const data: ClientMessage = JSON.parse(event.data);
                playerMessageHandler(data, socket);
            };

            socket.onclose = () => {
                console.log('[Log] A players disconnected');
            };

            socket.onerror = (error) => console.error('[Error] ', error);
            break;

        // Connection with a host
        case '/ws/host':
            if (url.hostname === 'localhost') {
                socket.onopen = () => {
                    const result = tryRegisterHostSocket(socket);
                    if (result) {
                        console.log('[Log] A host connected');
                    } else {
                        console.warn('[Warn] A host already connected');
                        socket.close(4002, 'DUPLICATE_CONNECTION');
                    }
                };

                socket.onmessage = (event) => {
                    console.log('[Log] A host message received');
                    const data: ClientMessage = JSON.parse(event.data);
                    hostMessageHandler(data, socket);
                };

                socket.onclose = (event) => {
                    console.log('[Log] A host disconnected');
                    if (event.code !== 4002) {
                        deleteHostSocket();
                    }
                };

                socket.onerror = (error) => console.error('[Error] ', error);
                break;
            } else {
                socket.close(4001, 'ACCESS_DENIED');
            }
            break;

        // Connection with a view (Sending only)
        case '/ws/view':
            if (url.hostname === 'localhost') {
                socket.onopen = () => {
                    const result = tryRegisterViewSocket(socket);
                    if (result) {
                        console.log('[Log] A View connected');
                    } else {
                        console.warn('[Warn] A view already connected');
                        socket.close(4002, 'DUPLICATE_CONNECTION');
                    }
                };

                socket.onclose = (event) => {
                    console.log('[Log] A view disconnected');
                    if (event.code !== 4002) {
                        deleteViewSocket();
                    }
                };

                socket.onerror = (error) => console.error('[Error] ', error);
                break;
            }
            break;
    }

    return response;
}

if (import.meta.main) {
    Deno.serve(handler);
}
