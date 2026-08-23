import { Player, QuizSettingsUpdate } from '../shared/types.ts';

const players: InternalPlayer[] = [];
let quizzes: { question: string; answer: string }[] = [];
let quizIndex: number = 0;

const settings = {
    speed: 10,
    correct: 10,
    incorrect: -10,
};

const restPenalty: number = 1;

let startTime: Temporal.Instant | null = null;

export function loadQuiz() {
    Deno.readTextFile('./quiz.tsv')
        .then((text) => {
            const lines = text.split('\n');
            quizzes = lines.map((l) => {
                const [question, answer] = l.split('\t');
                return { question, answer };
            });
        })
        .catch(() => console.error(`[Error] Quiz file reading failed`));
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
        restCount: 0,
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
function resetTime() {
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
            player.score += settings.correct;
            player.correct++;
        } else {
            player.score += settings.incorrect;
            player.state = 'REST';
            player.restCount = restPenalty;
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
    if (
        startTime !== null &&
        player &&
        !player.tappedAt &&
        player.state === 'ACTIVE'
    ) {
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
    const result = players.reduce((min, item) => {
        if (
            item.state === 'ACTIVE' &&
            item.tappedAt &&
            (min.state !== 'ACTIVE' ||
                !min.tappedAt ||
                Temporal.Duration.compare(min.tappedAt, item.tappedAt) > 0)
        ) {
            return item;
        }
        return min;
    });
    return result.state === 'ACTIVE' && result.tappedAt ? result.id : null;
}

// Reset tap state
export function resetTapped() {
    players.forEach((p) => {
        if (p.restCount > 1) {
            p.restCount -= 1;
        } else {
            p.restCount = 0;
            p.state = 'ACTIVE';
        }
        p.tappedAt = null;
    });
}

// Change current index
export function moveQuiz(delta: number) {
    resetTime();
    quizIndex += delta;
    if (quizIndex > quizzes.length) {
        quizIndex = quizzes.length;
    }
    if (quizIndex < 0) {
        quizIndex = 0;
    }
    resetTapped();
}

type QuizResult = {
    index: number;
    question?: string;
    answer?: string;
};

// Get a quiz of current index
export function getQuiz(): QuizResult {
    return {
        index: quizIndex,
        ...quizzes[quizIndex - 1],
    };
}

// Set quiz settings
export function setSettings(update: QuizSettingsUpdate) {
    if (update.speed !== undefined && update.speed >= -1) {
        settings.speed = update.speed;
    }
    if (update.correct !== undefined) {
        settings.correct = update.correct;
    }
    if (update.incorrect !== undefined) {
        settings.incorrect = update.incorrect;
    }
}

// Get quiz settings
export function getSettings() {
    return settings;
}
