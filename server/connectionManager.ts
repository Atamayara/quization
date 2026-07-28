import { ServerMessage } from '../shared/types.ts';

const sockets = new Map<string, WebSocket>();
const ids = new Map<WebSocket, string>();

let viewSocket: WebSocket | null = null;
let hostSocket: WebSocket | null = null;

// Register connection
export function registerSocket(id: string, socket: WebSocket) {
    sockets.set(id, socket);
    ids.set(socket, id);
}

// Remove connection
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

// Register connection with a host client
export function tryRegisterHostSocket(socket: WebSocket): boolean {
    if (hostSocket === null) {
        hostSocket = socket;
        return true;
    } else {
        return false;
    }
}

// Remove connection with a host client
export function deleteHostSocket() {
    hostSocket = null;
}

// Send message to a host client
export function sendToHost(message: ServerMessage) {
    if (hostSocket) {
        sendBySocket(hostSocket, message);
    }
}

// Register connection with a view client
export function tryRegisterViewSocket(socket: WebSocket): boolean {
    if (viewSocket === null || viewSocket.readyState !== WebSocket.OPEN) {
        viewSocket = socket;
        return true;
    } else {
        return false;
    }
}

// Remove connection with a view client
export function deleteViewSocket() {
    viewSocket = null;
}

// Send message to a view client
export function sendToView(message: ServerMessage) {
    if (viewSocket) {
        sendBySocket(viewSocket, message);
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
