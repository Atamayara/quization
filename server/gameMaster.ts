import { Player, ServerMessage } from '../shared/types.ts';

const players: InternalPlayer[] = [];
const questionIndex: number = 0;

interface InternalPlayer extends Player {
    key: string;
}

type JoinPlayerResult =
    | {
          state: 'SUCCESS';
          id: string;
          key: string;
      }
    | {
          state: 'FAILURE';
      };

type TapResult = {
    stopping?: boolean;
    players?: Player[];
};

// Convert InternalPlayer to Player
function removePlayerKey(player: InternalPlayer): Player {
    // deno-lint-ignore no-unused-vars
    const { key, ...result } = player;
    return result;
}

// Process when a player join
export function joinPlayer(
    name?: string,
    id?: string,
    key?: string,
): JoinPlayerResult {
    // Rejoin
    if (id && key) {
        const player = players.find((p) => p.id === id);
        if (player?.key === key) {
            return { state: 'SUCCESS', id: player.id, key: player.key };
        } else {
            return { state: 'FAILURE' };
        }
    }
    // Create player data
    const player: InternalPlayer = {
        key: crypto.randomUUID(),
        name: name ?? `プレイヤー ${players.length}`,
        id: crypto.randomUUID(),
        score: 0,
        correct: 0,
        incorrect: 0,
        isOnline: true,
        state: 'ACTIVE',
    };
    players.push(player);
    return { state: 'SUCCESS', id: player.id, key: player.key };
}

// Process when button is tapped
export function tapped(id: string, time: number): TapResult {
    const player = players.find((p) => p.id === id);
    if (player && player.tappedAt) {
        player.tappedAt = time;

        return {
            // [TODO] Enable condition for stopping reading
            stopping: true,
            players: players.map((p) => removePlayerKey(p)),
        };
    }
    return {};
}
