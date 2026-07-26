import { ClientMessage } from '../shared/types.ts';
import { messageHandler } from './messageHandler.ts';

export function handler(request: Request): Response {
    // ページへのアクセス
    if (request.headers.get('upgrade') !== 'websocket') {
        const url = new URL(request.url);
        return new Response('');
    }

    // WebSocket接続
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => console.log('[Log] A socket connected');

    socket.onmessage = (event) => {
        const data: ClientMessage = JSON.parse(event.data);
        messageHandler(data, socket);
    };

    socket.onclose = () => console.log('[Log] A socket disconnected');

    socket.onerror = (error) => console.error('[Error] ', error);

    return response;
}

if (import.meta.main) {
    Deno.serve(handler);
}
