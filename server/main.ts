import { serveDir, serveFile } from '@std/http/file-server';
import { ClientMessage } from '../shared/types.ts';
import {
    deleteHostSocket,
    deleteSocket,
    deleteViewSocket,
    getIdBySocket,
    sendToHostAndView,
    tryRegisterHostSocket,
    tryRegisterViewSocket,
} from './connectionManager.ts';
import { getPlayersAll, loadQuiz, setIsOnline } from './gameMaster.ts';
import {
    hostMessageHandler,
    playerMessageHandler,
    sendInitialData,
} from './messageHandler.ts';

loadQuiz();

Deno.serve((request: Request, info: Deno.ServeHandlerInfo) => {
    // Check whether the access is from localhost
    let isLocalhost;
    try {
        const addr = info.remoteAddr;
        if (addr && addr.transport === 'tcp') {
            isLocalhost =
                addr.hostname === '127.0.0.1' || addr.hostname === '::1';
        }
    } catch {
        isLocalhost = false;
    }

    // Access to pages
    const url = new URL(request.url);
    if (request.headers.get('upgrade') !== 'websocket') {
        const hasExtension = url.pathname.includes('.');
        if (!hasExtension) {
            return serveFile(request, './public/index.html');
        }
        return serveDir(request, {
            fsRoot: './public',
            quiet: true,
        });
    }

    // WebSocket connection
    const { socket, response } = Deno.upgradeWebSocket(request);

    switch (url.pathname) {
        // Connection with players
        case '/ws/player': {
            socket.onopen = () => console.log('[Log] A player connected');

            socket.onmessage = (event) => {
                console.log('[Log] A player message received');
                const data: ClientMessage = JSON.parse(event.data);
                playerMessageHandler(data, socket);
            };

            socket.onclose = () => {
                console.log('[Log] A players disconnected');
                const id = getIdBySocket(socket);
                if (id) {
                    setIsOnline(id, false);
                }
                deleteSocket(socket);
                sendToHostAndView({
                    type: 'S2C_VIEW_UPDATE',
                    payload: {
                        players: getPlayersAll(),
                    },
                });
            };

            socket.onerror = (error) => console.error('[Error] ', error);
            break;
        }

        // Connection with a host
        case '/ws/host': {
            if (isLocalhost) {
                socket.onopen = () => {
                    const result = tryRegisterHostSocket(socket);
                    if (result) {
                        console.log('[Log] A host connected');
                        sendInitialData();
                    } else {
                        console.warn('[Warn] A host already connected');
                        socket.close(4002, 'DUPLICATE_CONNECTION');
                    }
                };

                socket.onmessage = (event) => {
                    console.log('[Log] A host message received');
                    const data: ClientMessage = JSON.parse(event.data);
                    hostMessageHandler(data);
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
                console.warn('[Warn] A host access denied');
                socket.close(4001, 'ACCESS_DENIED');
            }
            break;
        }

        // Connection with a view (Sending only)
        case '/ws/view': {
            if (isLocalhost) {
                socket.onopen = () => {
                    const result = tryRegisterViewSocket(socket);
                    if (result) {
                        console.log('[Log] A view connected');
                        sendInitialData();
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
            } else {
                console.warn('[Warn] A host access denied');
                socket.close(4001, 'ACCESS_DENIED');
            }
            break;
        }
    }

    return response;
});
