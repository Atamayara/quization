import { useRef, useState } from 'react';
import useViewSocket from '../../hook/useViewSocket';
import QuestionText, {
    type QuestionTextHandle,
} from '../../components/QuestionText';
import AnswerText, { type AnswerTextHandle } from '../../components/AnswerText';
import styles from './ViewPage.module.css';

function ViewPage() {
    const { quiz, isConnected, players, tapper } = useViewSocket({
        start: start,
        pause: pause,
        stop: stop,
        correct: correct,
        incorrect: incorrect,
    });

    const questionTextHandleRef = useRef<QuestionTextHandle | null>(null);
    const answerTextHandleRef = useRef<AnswerTextHandle | null>(null);

    const [isReading, setIsReading] = useState<boolean>(false);

    // Start reading
    function start() {
        setIsReading(true);
    }

    // Pause reading
    function pause() {
        setIsReading(false);
    }

    // Stop reading
    function stop() {
        questionTextHandleRef.current?.showAll();
        answerTextHandleRef.current?.show();
    }

    // [TODO] Styling
    const [temp, setTemp] = useState<string>('');

    // Mark as correct
    function correct() {
        setTemp(temp + 'o');
    }

    // Mark as incorrect
    function incorrect() {
        setTemp(temp + 'x');
    }

    return (
        // [TODO] Styling
        <div className={styles.container}>
            {isConnected ? (
                <>
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
                            <div className={styles.index}>第{quiz.index}問</div>
                            <QuestionText
                                ref={questionTextHandleRef}
                                className={styles.question}
                                text={quiz.question ?? ''}
                                speed={quiz.speed ?? 5}
                                isReading={isReading}
                            />
                            <AnswerText
                                key={quiz.index}
                                className={styles.answer}
                                ref={answerTextHandleRef}
                                answer={quiz.answer ?? ''}
                            />
                        </div>
                    ) : (
                        <div className={styles.info}>Waiting...</div>
                    )}
                    <div className={styles.cards}>
                        {players
                            .sort((a, b) => a.score - b.score)
                            .map((player, index) => {
                                return (
                                    <div key={index} className={styles.card}>
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
                </>
            ) : (
                // [TODO] Error processing
                <p>Connection error</p>
            )}
        </div>
    );
}

export default ViewPage;
