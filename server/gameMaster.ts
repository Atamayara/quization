import { Player } from '../shared/types.ts';

const players: InternalPlayer[] = [];
const quizzes: { question: string; answer: string }[] = [];
let quizIndex: number = 0;
const correctScore: number = 10;
const incorrectScore: number = -10;

let startTime: Temporal.Instant | null = null;

// [TEMP] Sample quiz
for (let i = 1; i < 10; i++) {
    quizzes.push({
        question: `question ${i}`,
        answer: `answer ${i}`,
    });
}

interface InternalPlayer extends Player {
    key: string;
}

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
            player.isOnline = true;
            return player;
        }
    }
    console.log();
    // Create player data
    const player: InternalPlayer = {
        key: crypto.randomUUID(),
        name: name ?? `Player ${players.length + 1}`,
        id: crypto.randomUUID(),
        score: 0,
        correct: 0,
        incorrect: 0,
        tappedAt: null,
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

// Set start time
export function setTime() {
    startTime = Temporal.Now.instant();
}

// Reset start time
export function resetTime() {
    startTime = null;
}

// Change score
export function changeScore(id: string, score: number) {
    const player = getPlayerById(id);
    if (player) {
        player.score = score;
    }
}

// Mark
export function mark(id: string, result: boolean) {
    const player = getPlayerById(id);
    if (player) {
        if (result) {
            player.score += correctScore;
            player.correct++;
        } else {
            player.score += incorrectScore;
            player.state = 'REST';
            player.incorrect++;
        }
    }
}

// Set connection state
export function setIsOnline(id: string, isOnline: boolean) {
    const player = getPlayerById(id);
    if (player) {
        player.isOnline = isOnline;
    }
}

type TapResult = {
    players?: Player[];
};

// Process when button is tapped
export function tapped(id: string): TapResult {
    const player = getPlayerById(id);
    if (player && !player.tappedAt && player.state === 'ACTIVE') {
        const time = Temporal.Now.instant();
        player.tappedAt = startTime?.until(time) ?? null;
        return {
            players: players.map((p) => removePlayerKey(p)),
        };
    }
    return {};
}

// Get the next answerer
export function getAnswererId(): string | null {
    if (!players.some((p) => p.state === 'ACTIVE' && p.tappedAt)) {
        return null;
    }
    return players.reduce((min, item) => {
        if (item.state === 'ACTIVE' && min.tappedAt && item.tappedAt) {
            return min.tappedAt < item.tappedAt ? min : item;
        } else {
            return min;
        }
    }).id;
}

// Reset tap state
export function resetTapped() {
    players.forEach((p) => {
        p.state = 'ACTIVE';
        p.tappedAt = null;
    });
}

// Change current index
export function moveQuiz(delta: number) {
    quizIndex += delta;
    resetTapped();
}

type QuizResult = {
    index: number;
    question?: string;
    answer?: string;
};

// Get a quiz of current index
export function getQuiz(): QuizResult {
    return quizIndex > 0
        ? {
              index: quizIndex,
              ...quizzes[quizIndex - 1],
          }
        : {
              index: 0,
          };
}
