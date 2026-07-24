export function handler(request: Request): Response {
    // ページへのアクセス
    if (request.headers.get('upgrade') !== 'websocket') {
        const url = new URL(request.url);
        return new Response('');
    }

    // WebSocket接続
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => console.log('Connected');

    socket.onmessage = (event) => console.log(`Received: ${event.data}`);

    socket.onclose = () => console.log('DISCONNECTED');

    socket.onerror = (error) => console.error('ERROR:', error);

    return response;
}

if (import.meta.main) {
    Deno.serve(handler);
}
