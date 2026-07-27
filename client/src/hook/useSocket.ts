import { useEffect, useRef, useState } from 'react';
import type { ClientMessage, ServerMessage } from '../../../shared/types.ts';

type useWebSocketArgs = {
    onConnected?: () => void;
    onMessage?: (message: ServerMessage) => void;
    onDisconnected?: () => void;
};

// provide features of WebSocket
export function useSocket(args: useWebSocketArgs) {
    const socketRef = useRef<WebSocket | null>(null);
    const onConnectRef = useRef<() => void | null>(null);
    const onMessageRef = useRef<(message: ServerMessage) => void | null>(null);
    const onDisconnectRef = useRef<() => void | null>(null);

    const [isConnected, setIsConnected] = useState<boolean>(false);

    // Set handlers
    useEffect(() => {
        onConnectRef.current = args.onConnected ?? null;
        onMessageRef.current = args.onMessage ?? null;
        onDisconnectRef.current = args.onDisconnected ?? null;
    }, [args]);

    // Connect to the server and
    useEffect(() => {
        const wsUri = `ws://localhost:8000/`;
        const socket = new WebSocket(wsUri);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('[Log] Connected');
            setIsConnected(true);
            if (onConnectRef.current) {
                onConnectRef.current();
            }
        };

        socket.onmessage = (message) => {
            console.log('[Log] Message received');
            const object: ServerMessage = JSON.parse(message.data);
            if (onMessageRef.current) {
                onMessageRef.current(object);
            }
        };

        socket.onclose = () => {
            console.log('[Log] Disconnected');
            if (onDisconnectRef.current) {
                onDisconnectRef.current();
            }
        };
    }, []);

    // Send message to the server
    function sendMessage(message: ClientMessage) {
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            const json = JSON.stringify(message);
            socketRef.current.send(json);
        }
    }

    return { isConnected, sendMessage };
}

export default useSocket;
