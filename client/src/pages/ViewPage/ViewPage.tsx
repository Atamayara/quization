import { useRef, useState } from 'react';
import useViewSocket from '../../hook/useViewSocket';
import QuestionText, {
    type QuestionTextHandle,
} from '../../components/QuestionText';
import AnswerText, { type AnswerTextHandle } from '../../components/AnswerText';
import styles from './ViewPage.module.css';
import useSoundEffects from '../../hook/useSoundEffects';

function ViewPage() {
    const { quiz, isConnected, players, tapper } = useViewSocket({
        start: start,
        pause: pause,
        stop: stop,
        correct: correct,
        incorrect: incorrect,
        tap: tap,
    });

    const playSEs = useSoundEffects();

    const questionTextHandleRef = useRef<QuestionTextHandle | null>(null);
    const answerTextHandleRef = useRef<AnswerTextHandle | null>(null);
    const readingWaitRef = useRef<number | null>(null);

    const [isReading, setIsReading] = useState<boolean>(false);
    const [correctDisplayed, setCorrectDisplayed] = useState<boolean>(false);
    const [incorrectDisplayed, setIncorrectDisplayed] =
        useState<boolean>(false);
    const [soundState, setSoundState] = useState<boolean>(false);

    // Start reading
    function start() {
        if (soundState) {
            playSEs('quiz');
        }
        readingWaitRef.current = setTimeout(() => {
            setIsReading(true);
        }, 1000);
    }

    // Pause reading
    function pause() {
        if (readingWaitRef.current) {
            clearTimeout(readingWaitRef.current);
            readingWaitRef.current = null;
        }
        setIsReading(false);
    }

    // Stop reading
    function stop() {
        if (readingWaitRef.current) {
            clearTimeout(readingWaitRef.current);
            readingWaitRef.current = null;
        }
        questionTextHandleRef.current?.showAll();
        answerTextHandleRef.current?.show();
    }

    // Mark as correct
    function correct() {
        setCorrectDisplayed(true);
        if (soundState) {
            playSEs('correct');
        }
    }

    // Mark as incorrect
    function incorrect() {
        setIncorrectDisplayed(true);
        if (soundState) {
            playSEs('incorrect');
        }
    }

    // Tap
    function tap() {
        if (soundState && tapper === null) {
            playSEs('tap');
        }
    }

    // Toggle playback availability
    function ToggleSound() {
        if (!soundState) {
            playSEs('tap');
        }
        setSoundState(!soundState);
    }

    return (
        <div className={styles.container}>
            {isConnected ? (
                <>
                    <div className={styles.figure}>
                        {correctDisplayed && (
                            <div
                                key={`f_o_${quiz.index}`}
                                className={styles.circle}
                                onAnimationEnd={() =>
                                    setCorrectDisplayed(false)
                                }></div>
                        )}
                        {incorrectDisplayed && (
                            <div
                                key={`f_x_${quiz.index}`}
                                className={styles.cross}
                                onAnimationEnd={() =>
                                    setIncorrectDisplayed(false)
                                }>
                                <div className={styles.tl}></div>
                                <div className={styles.tr}></div>
                            </div>
                        )}
                    </div>
                    {tapper && (
                        <div className={styles.tap}>
                            <div className={styles.window}>
                                <div className={styles.responder}>
                                    <div>Responder</div>
                                </div>
                                <div className={styles.player}>
                                    <div>
                                        {
                                            players.find((p) => p.id === tapper)
                                                ?.name
                                        }
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <div>Answering...</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {quiz.index && quiz.index > 0 ? (
                        <div className={styles.quiz}>
                            <div className={styles.index}>Q{quiz.index}.</div>
                            <QuestionText
                                ref={questionTextHandleRef}
                                className={styles.question}
                                text={quiz.question ?? ''}
                                speed={quiz.speed ?? -1}
                                isReading={isReading}
                            />
                            <AnswerText
                                key={`ans_${quiz.index}`}
                                className={styles.answer}
                                ref={answerTextHandleRef}
                                answer={quiz.answer ?? ''}
                            />
                        </div>
                    ) : (
                        <div className={styles.info}>
                            Waiting...{' '}
                            <button onClick={() => ToggleSound()}>
                                {soundState ? '🔊' : '🔇'}
                            </button>
                        </div>
                    )}
                    {players.length > 0 && (
                        <div className={styles.cards}>
                            {players
                                .sort((a, b) => {
                                    if (a.isOnline !== b.isOnline) {
                                        return a.isOnline ? -1 : 1;
                                    }
                                    return b.score - a.score;
                                })
                                .map((player, index) => {
                                    return (
                                        <div
                                            key={`p_${index}`}
                                            className={styles.card}
                                            data-state={player.state}
                                            data-online={
                                                player.isOnline
                                                    ? 'ONLINE'
                                                    : 'OFFLINE'
                                            }>
                                            <div className={styles.name}>
                                                <div>{player.name}</div>
                                            </div>
                                            <div className={styles.score}>
                                                <div>{player.score}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </>
            ) : (
                <p>Connection error</p>
            )}
        </div>
    );
}

export default ViewPage;
