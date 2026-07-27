import { ServerMessage } from '../shared/types.ts';

const sockets = new Map<string, WebSocket>();
const ids = new Map<WebSocket, string>();

const viewSocket: WebSocket | null = null;
const hostSocket: WebSocket | null = null;

// Register connection with an id
export function registerSocket(id: string, socket: WebSocket) {
    sockets.set(id, socket);
    ids.set(socket, id);
}

// Remove connection with an id
export function deleteSocket(socket: WebSocket) {
    const id = getIdBySocket(socket);
    if (id) {
        sockets.delete(id);
    }
    ids.delete(socket);
}

// Get an id by a socket
export function getIdBySocket(socket: WebSocket) {
    return ids.get(socket);
}

// Send message to player clients
export function sendToPlayer(message: ServerMessage, id?: string) {
    if (!id) {
        for (const socket of sockets.values()) {
            sendBySocket(socket, message);
        }
    } else {
        const socket = sockets.get(id);
        if (socket) {
            sendBySocket(socket, message);
        }
    }
}

// Send message to view client
export function sendToView(message: ServerMessage) {
    if (viewSocket) {
        sendBySocket(viewSocket, message);
    }
}

// Send message to host client
export function sendToHost(message: ServerMessage) {
    if (hostSocket) {
        sendBySocket(hostSocket, message);
    }
}

// Send message to a socket
function sendBySocket(socket: WebSocket, message: ServerMessage) {
    const json = JSON.stringify(message);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(json);
    } else {
        console.warn(
            `[Warn] Failed to send message: ${message.type} / state: ${socket.readyState}`,
        );
    }
}
