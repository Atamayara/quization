import { Player } from '../shared/types.ts';

const players: InternalPlayer[] = [];
const quizzes: { question: string; answer: string }[] = [];
let quizIndex: number = 0;
const correctScore: number = 10;
const incorrectScore: number = -10;

// temp
for (let i = 0; i < 10; i++) {
    quizzes.push({
        question: `question ${i}`,
        answer: `answer ${i}`,
    });
}

interface InternalPlayer extends Player {
    key: string;
}

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
): InternalPlayer {
    // Rejoin
    if (id && key) {
        const player = getPlayerById(id);
        if (player?.key === key) {
            if (name) {
                player.name = name;
            }
            return player;
        }
    }
    console.log();
    // Create player data
    const player: InternalPlayer = {
        key: crypto.randomUUID(),
        name: name ?? `プレイヤー ${players.length + 1}`,
        id: crypto.randomUUID(),
        score: 0,
        correct: 0,
        incorrect: 0,
        isOnline: true,
        state: 'ACTIVE',
    };
    players.push(player);
    return player;
}

// Get all players
function getPlayerById(id: string) {
    return players.find((p) => p.id === id);
}

// Get all players
export function getPlayersAll() {
    return players.map((p) => removePlayerKey(p));
}

// Change score
export function changeScore(id: string, score: number) {
    const player = getPlayerById(id);
    if (player) {
        player.score = score;
    }
}

// Mark
export function Mark(id: string, result: boolean) {
    const player = getPlayerById(id);
    if (player) {
        if (result) {
            player.score += correctScore;
        } else {
            player.score += incorrectScore;
            // player.state = 'REST'; [TODO] Apply rest state
        }
    }
}

// Process when button is tapped
export function tapped(id: string, time: number): TapResult {
    const player = getPlayerById(id);
    if (player && player.tappedAt) {
        player.tappedAt = time;

        return {
            // [TODO] Condition for stopping reading
            stopping: true,
            players: players.map((p) => removePlayerKey(p)),
        };
    }
    return {};
}

// Change current index
export function moveQuiz(delta: number) {
    quizIndex += delta;
}

// Get a quiz of current index
export function getQuiz() {
    return {
        index: quizIndex,
        ...quizzes[quizIndex],
    };
}
